import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IMultiplayerSessionHistoryRepository } from "src/lib/multiplayer/domain/repositories/IMultiplayerSessionHistoryRepository";
import { TypeOrmMultiplayerSessionEntity } from "./TypeOrmMultiplayerSessionEntity";
import { MultiplayerSession } from "src/lib/multiplayer/domain/aggregates/MultiplayerSession";
import { MultiplayerSessionId } from "src/lib/shared/domain/ids";
import { Collection, Db } from 'mongodb';
import { DynamicMongoAdapter } from "src/lib/shared/infrastructure/database/dynamic-mongo.adapter";
import { MongoMultiplayerSessionDocument } from "./TypeOrmMultiplayerSessionEntity";
import { QuestionId } from "src/lib/kahoot/domain/valueObject/Question";
import { PlayerId, PlayerNickname } from "src/lib/multiplayer/domain/valueObjects/playerVOs";
import { Player } from "src/lib/multiplayer/domain/entities/Player";
import { GameScore } from "src/lib/shared/domain/valueObjects";
import { Leaderboard, LeaderboardEntry, MultiplayerAnswer, MultiplayerQuestionResult, SessionPin, SessionProgress, SessionState } from "src/lib/multiplayer/domain/valueObjects/multiplayerVOs";
import { Optional } from "src/lib/shared/Type Helpers/Optional";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { QuizId } from "src/lib/kahoot/domain/valueObject/Quiz";

@Injectable()
export class MultiplayerSessionHistoryTypeOrmRepository implements IMultiplayerSessionHistoryRepository {

    constructor(
        @InjectRepository(TypeOrmMultiplayerSessionEntity)
        private readonly sessionRepository: Repository<TypeOrmMultiplayerSessionEntity>,

        private readonly mongoAdapter: DynamicMongoAdapter
    ) {}

    async archiveSession(session: MultiplayerSession): Promise<void> {
        try {
            // 1. Intenta guardar en MongoDB
            const collection = await this.getMongoCollection();
            
            const entity = TypeOrmMultiplayerSessionEntity.fromDomain(session);
            const mongoDoc: MongoMultiplayerSessionDocument = {
                _id: entity.sessionId,
                hostId: entity.hostId,
                quizId: entity.quizId,
                sessionPin: entity.sessionPin,
                startedAt: entity.startedAt,
                completedAt: entity.completedAt,
                currentQuestionStartTime: entity.currentQuestionStartTime,
                sessionState: entity.sessionState,
                leaderboard: entity.leaderboard,
                progress: entity.progress,
                players: entity.players,
                playersAnswers: entity.playersAnswers
            };
            
            await collection.replaceOne({ _id: mongoDoc._id }, mongoDoc, { upsert: true });
            console.log(`Session ${session.getId().getId()} archived to MongoDB successfully.`);
            
        } catch (error) {
            // 2. Fallback a PostgreSQL
            console.log('MongoDB connection not available, falling back to PostgreSQL for archiveSession.');
            session.validateAllInvariantsForCompletion();
            const entity = TypeOrmMultiplayerSessionEntity.fromDomain(session);
            await this.sessionRepository.save(entity);
        }
    }

    async findbyId(sessionId: MultiplayerSessionId): Promise<MultiplayerSession | null> {
        try {
            // 1. Intenta buscar en MongoDB
            const collection = await this.getMongoCollection();
            const mongoDoc = await collection.findOne({ _id: sessionId.getId() });
            
            if (!mongoDoc) return null;
            
            return this.mapMongoToDomain(mongoDoc);
            
        } catch (error) {
            // 2. Fallback a PostgreSQL
            console.log('MongoDB connection not available, falling back to PostgreSQL for findById.');
            const entity = await this.sessionRepository.findOne({
                where: { sessionId: sessionId.getId() }
            });
            return entity ? entity.toDomain() : null;
        }
    }

    private async getMongoCollection(): Promise<Collection<MongoMultiplayerSessionDocument>> {
        const db: Db = await this.mongoAdapter.getConnection('multiplayersessions');
        return db.collection<MongoMultiplayerSessionDocument>('sessions');
    }

    private mapMongoToDomain(mongoDoc: MongoMultiplayerSessionDocument): MultiplayerSession {
        // Convertir players JSON a Map<PlayerId, Player>
        const playersMap = new Map<string, Player>();
        mongoDoc.players.forEach(playerJson => {
            const player = Player.create(
                PlayerId.of(playerJson.playerId),
                PlayerNickname.create(playerJson.nickname),
                GameScore.create(playerJson.score),
                playerJson.streak,
                playerJson.isGuest,
            );
            playersMap.set(playerJson.playerId, player);
        });

        // Convertir playersAnswers JSON a Map<QuestionId, MultiplayerQuestionResult>
        const answersMap = new Map<string, MultiplayerQuestionResult>();
        mongoDoc.playersAnswers.forEach(resultJson => {
            const questionId = QuestionId.of(resultJson.questionId);
            
            // Convertir answers JSON a Map<PlayerId, MultiplayerAnswer>
            const answersMapForQuestion = new Map<string, MultiplayerAnswer>();
            resultJson.answers.forEach(answerJson => {
                const answer = MultiplayerAnswer.create(
                    PlayerId.of(answerJson.playerId),
                    QuestionId.of(answerJson.questionId),
                    answerJson.answerIndex,
                    answerJson.isCorrect,
                    GameScore.create(answerJson.earnedScore),
                    answerJson.timeElapsed
                );
                answersMapForQuestion.set(answerJson.playerId, answer);
            });

            // Crear MultiplayerQuestionResult 
            const questionResult = MultiplayerQuestionResult.fromMap(questionId, answersMapForQuestion);
            answersMap.set(resultJson.questionId, questionResult);
        });

        // Convertir leaderboard JSON a Leaderboard
        const leaderboardEntries: LeaderboardEntry[] = mongoDoc.leaderboard.map(entryJson => 
            LeaderboardEntry.create(
                PlayerId.of(entryJson.playerId),
                PlayerNickname.create(entryJson.nickname),
                GameScore.create(entryJson.score),
                entryJson.rank,
                entryJson.previousRank
            )
        );
        const leaderboard = Leaderboard.fromMap(leaderboardEntries);

        // Convertir progress JSON a SessionProgress
        const progress = SessionProgress.create(
            QuestionId.of(mongoDoc.progress.currentQuestion),
            mongoDoc.progress.previousQuestion ? 
                new Optional<QuestionId>(QuestionId.of(mongoDoc.progress.previousQuestion)) : 
                new Optional<QuestionId>(undefined),
            mongoDoc.progress.totalQuestions,
            mongoDoc.progress.questionsAnswered
        );

        return MultiplayerSession.fromDb(
            MultiplayerSessionId.of(mongoDoc._id),
            UserId.of(mongoDoc.hostId),
            QuizId.of(mongoDoc.quizId),
            SessionPin.create(mongoDoc.sessionPin),
            new Date(mongoDoc.startedAt),
            new Optional<Date>(new Date(mongoDoc.completedAt)),
            new Date(mongoDoc.currentQuestionStartTime),
            SessionState.createAsAny(mongoDoc.sessionState),
            leaderboard,
            progress,
            playersMap,
            answersMap
        );
    }
}
