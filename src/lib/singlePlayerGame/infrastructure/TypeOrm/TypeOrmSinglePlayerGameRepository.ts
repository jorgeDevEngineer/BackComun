import { InjectRepository } from "@nestjs/typeorm";
import { SinglePlayerGameRepository } from "../../domain/repositories/SinglePlayerGameRepository";
import { TypeOrmSinglePlayerGameEntity } from "./TypeOrmSinglePlayerGameEntity";
import { Injectable } from "@nestjs/common";
import { SinglePlayerGame } from "../../domain/aggregates/SinglePlayerGame";
import { SinglePlayerGameId } from "src/lib/shared/domain/ids";
import { EvaluatedAnswer, GameProgress, GameProgressStatus, PlayerAnswer, QuestionResult } from "../../domain/valueObjects/SinglePlayerGameVOs";
import { QuizId, UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { Repository } from "typeorm";
import { DynamicMongoAdapter } from "src/lib/shared/infrastructure/database/dynamic-mongo.adapter";
import { Collection, Db } from "mongodb";
import { MongoSinglePlayerGameDocument } from "./TypeOrmSinglePlayerGameEntity";
import { QuestionId } from "src/lib/kahoot/domain/valueObject/Question";
import { GameScore } from "src/lib/shared/domain/valueObjects";
import { Optional } from "src/lib/shared/Type Helpers/Optional";

@Injectable()
export class TypeOrmSinglePlayerGameRepository implements SinglePlayerGameRepository {

    constructor(
        @InjectRepository(TypeOrmSinglePlayerGameEntity)
        private readonly gameRepo: Repository<TypeOrmSinglePlayerGameEntity>,

        private readonly mongoAdapter: DynamicMongoAdapter
    ) {}

    async save(game: SinglePlayerGame): Promise<void> {
        try {
            // 1. Intenta guardar en MongoDB
            const collection = await this.getMongoCollection();
            const entity = TypeOrmSinglePlayerGameEntity.fromDomain(game);
            const mongoDoc = {
                _id: entity.gameId,
                quizId: entity.quizId,
                totalQuestions: entity.totalQuestions,
                playerId: entity.playerId,
                status: entity.status,
                progress: entity.progress,
                score: entity.score,
                startedAt: entity.startedAt,
                completedAt: entity.completedAt,
                questionResults: entity.questionResults
            };
            await collection.replaceOne({ _id: mongoDoc._id }, mongoDoc, { upsert: true });
        } catch (error) {
            // 2. Fallback a PostgreSQL
            console.log('MongoDB connection not available, falling back to PostgreSQL for save.');
            const entity = TypeOrmSinglePlayerGameEntity.fromDomain(game);
            await this.gameRepo.save(entity);
        }
    }

    async delete(gameId: SinglePlayerGameId): Promise<void> {
        try {
            const collection = await this.getMongoCollection();
            await collection.deleteOne({ _id: gameId.getId() });
        } catch (error) {
            console.log('MongoDB connection not available, falling back to PostgreSQL for delete.');
            await this.gameRepo.delete(gameId.getId());
        }
    }

    async findById(gameId: SinglePlayerGameId): Promise<SinglePlayerGame | null> {
        try {
            const collection = await this.getMongoCollection();
            const mongoDoc = await collection.findOne({ _id: gameId.getId() });
            
            if (!mongoDoc) return null;
            
            return this.mapMongoToDomain(mongoDoc);
        } catch (error) {
            console.log('MongoDB connection not available, falling back to PostgreSQL for findById.');
            const entity = await this.gameRepo.findOne({
                where: { gameId: gameId.getId() }
            });
            return entity ? entity.toDomain() : null;
        }
    }

    async findByPlayerId(playerId: UserId): Promise<SinglePlayerGame[]> {
        try {
            const collection = await this.getMongoCollection();
            const cursor = await collection.find({ playerId: playerId.getValue() });
            const mongoDocs = await cursor.toArray();
            
            return mongoDocs.map(doc => this.mapMongoToDomain(doc));
        } catch (error) {
            console.log('MongoDB connection not available, falling back to PostgreSQL for findByPlayerId.');
            const entities = await this.gameRepo.find({
                where: { playerId: playerId.getValue() },
                order: { startedAt: 'DESC' }
            });
            return entities.map(entity => entity.toDomain());
        }
    }

     async findInProgressGameByPlayerAndQuiz(playerId: UserId, quizId: QuizId): Promise<SinglePlayerGame | null> {
        try {
            const collection = await this.getMongoCollection();
            const mongoDoc = await collection.findOne({ 
                playerId: playerId.getValue(),
                quizId: quizId.getValue(),
                status: GameProgressStatus.IN_PROGRESS
            });
            if (!mongoDoc) return null;
            return this.mapMongoToDomain(mongoDoc);
        } catch (error) {
            console.log('MongoDB connection not available, falling back to PostgreSQL for findInProgressGameByPlayerAndQuiz.');
            const entity = await this.gameRepo.findOne({
                where: { 
                    playerId: playerId.getValue(),
                    quizId: quizId.getValue(),
                    status: GameProgressStatus.IN_PROGRESS
                }
            });
            return entity ? entity.toDomain() : null;
        }
    }

    async findInProgressGames(playerId: UserId): Promise<SinglePlayerGame[]> {
        try {
            const collection = await this.getMongoCollection();
            const cursor = await collection.find({ 
                playerId: playerId.getValue(),
                status: GameProgressStatus.IN_PROGRESS
            });
            const mongoDocs = await cursor.toArray();
            
            return mongoDocs.map(doc => this.mapMongoToDomain(doc));
        } catch (error) {
            console.log('MongoDB connection not available, falling back to PostgreSQL for findInProgressGames.');
            const entities = await this.gameRepo.find({
                where: { 
                    playerId: playerId.getValue(),
                    status: GameProgressStatus.IN_PROGRESS
                },
                order: { startedAt: 'DESC' }
            });
            return entities.map(entity => entity.toDomain());
        }
    }

    async findCompletedGames(playerId: UserId): Promise<SinglePlayerGame[]> {
        try {
            const collection = await this.getMongoCollection();
            const cursor = await collection.find({ 
                playerId: playerId.getValue(),
                status: GameProgressStatus.COMPLETED
            });
            const mongoDocs = await cursor.toArray();
            return mongoDocs.map(doc => this.mapMongoToDomain(doc));
        } catch (error) {
            console.log('MongoDB connection not available, falling back to PostgreSQL for findCompletedGames.');
            const entities = await this.gameRepo.find({
                where: { 
                    playerId: playerId.getValue(),
                    status: GameProgressStatus.COMPLETED
                },
                order: { startedAt: 'DESC' }
            });
            return entities.map(entity => entity.toDomain());
        }
    }

    private async getMongoCollection(): Promise<Collection<MongoSinglePlayerGameDocument>> {
        const db: Db = await this.mongoAdapter.getConnection('asyncgame');
        return db.collection<MongoSinglePlayerGameDocument>('attempts');
    }

    private mapMongoToDomain(mongoDoc: MongoSinglePlayerGameDocument): SinglePlayerGame {
        const questionResults: QuestionResult[] = mongoDoc.questionResults.map(questionResultJson => {
            
            const playerAnswer = PlayerAnswer.create(
                QuestionId.of(questionResultJson.questionId),
                questionResultJson.answerIndex,
                questionResultJson.timeUsedMs
            );

            const evaluatedAnswer = EvaluatedAnswer.create(
                questionResultJson.wasCorrect,
                questionResultJson.pointsEarned
            );

            return QuestionResult.create(
                QuestionId.of(questionResultJson.questionId),
                playerAnswer,
                evaluatedAnswer
            );
        });

        return SinglePlayerGame.fromDb(
            SinglePlayerGameId.of(mongoDoc._id),
            QuizId.of(mongoDoc.quizId),
            mongoDoc.totalQuestions,
            UserId.of(mongoDoc.playerId),
            GameProgress.create(mongoDoc.progress),
            GameScore.create(mongoDoc.score),
            new Date(mongoDoc.startedAt),
            new Optional<Date>(mongoDoc.completedAt ? new Date(mongoDoc.completedAt) : undefined),
            questionResults
        );
    }
}
