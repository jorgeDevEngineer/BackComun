import { Injectable } from "@nestjs/common";
import { Optional } from "src/lib/shared/Type Helpers/Optional";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { MultiplayerSessionHistoryRepository } from "../../../domain/port/MultiplayerSessionHistoryRepository";
import { TypeOrmMultiplayerSessionEntity } from "src/lib/multiplayer/infrastructure/repositories/TypeOrm/TypeOrmMultiplayerSessionEntity";
import { MultiplayerSession } from "src/lib/multiplayer/domain/aggregates/MultiplayerSession";
import { DynamicMongoAdapter } from "src/lib/shared/infrastructure/database/dynamic-mongo.adapter";
import { QuizQueryCriteria } from "src/lib/library/application/Response Types/QuizQueryCriteria";
import { CriteriaApplier } from "src/lib/library/domain/port/CriteriaApplier";
import { QuizId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { Collection, Db, ObjectId } from "mongodb";
import { QuestionId } from "src/lib/kahoot/domain/valueObject/Question";
import { Player } from "src/lib/multiplayer/domain/entities/Player";
import {
  MultiplayerQuestionResult,
  MultiplayerAnswer,
  LeaderboardEntry,
  Leaderboard,
  SessionProgress,
  SessionPin,
  SessionState,
  SessionStateType,
} from "src/lib/multiplayer/domain/valueObjects/multiplayerVOs";
import {
  PlayerId,
  PlayerNickname,
} from "src/lib/multiplayer/domain/valueObjects/playerVOs";
import { MultiplayerSessionId } from "src/lib/shared/domain/ids";
import { GameScore } from "src/lib/shared/domain/valueObjects";
import { MongoCriteriaApplier } from "../Criteria Appliers/Mongo/MongoCriteriaApplier";
import { MongoMultiplayerSessionDocument } from "../../../../multiplayer/infrastructure/repositories/TypeOrm/TypeOrmMultiplayerSessionEntity";

@Injectable()
export class DynamicMultiplayerGameRepository
  implements MultiplayerSessionHistoryRepository
{
  constructor(
    @InjectRepository(TypeOrmMultiplayerSessionEntity)
    private readonly sessionRepository: Repository<TypeOrmMultiplayerSessionEntity>,
    private readonly pgCriteriaApplier: CriteriaApplier<
      SelectQueryBuilder<TypeOrmMultiplayerSessionEntity>,
      QuizQueryCriteria
    >,
    private readonly mongoAdapter: DynamicMongoAdapter,
    private readonly mongoCriteriaApplier: MongoCriteriaApplier<MongoMultiplayerSessionDocument>
  ) {}

  private async getMongoCollection(): Promise<
    Collection<MongoMultiplayerSessionDocument>
  > {
    const db: Db = await this.mongoAdapter.getConnection("multiplayersessions");
    return db.collection<MongoMultiplayerSessionDocument>("sessions");
  }

  async findCompletedSessions(
    playerId: UserId,
    criteria: QuizQueryCriteria
  ): Promise<[MultiplayerSession[], number]> {
    try {
      // 🔹 Mongo
      console.log(
        "Trying to fetch completed multiplayer sessions from MongoDB..."
      );
      const collection = await this.getMongoCollection();

      const params = {
        filter: {
          sessionState: "end",
          "players.playerId": playerId.getValue(),
        },
      };

      const { filter, options } = this.mongoCriteriaApplier.apply(
        params,
        criteria
      );
      const docs = await collection.find(filter, options).toArray();
      const total = await collection.countDocuments(filter);

      const sessions = docs.map((doc) => this.mapMongoToDomain(doc));
      return [sessions, total];
    } catch (error) {
      // 🔹 Postgres
      let qb = this.sessionRepository.createQueryBuilder("multiplayerSessions");

      console.log(
        "Falling back to Postgres for completed multiplayer sessions"
      );

      qb.andWhere(`multiplayerSessions.sessionState = :status`, {
        status: "end",
      });

      // ✅ Usar JOIN LATERAL para descomponer players
      qb.andWhere(
        `
        EXISTS (
          SELECT 1
          FROM jsonb_array_elements("multiplayerSessions"."players"::jsonb) AS elem
          WHERE elem->>'playerId' = :playerId
        )
      `,
        { playerId: playerId.getValue() }
      );

      qb = this.pgCriteriaApplier.apply(qb, criteria, "multiplayerSessions");

      const [entities, total] = await qb.getManyAndCount();
      return [entities.map((entity) => entity.toDomain()), total];
    }
  }

  private mapMongoToDomain(
    mongoDoc: MongoMultiplayerSessionDocument
  ): MultiplayerSession {
    // Convertir players JSON a Map<PlayerId, Player>
    const playersMap = new Map<string, Player>();
    mongoDoc.players.forEach((playerJson) => {
      const player = Player.create(
        PlayerId.of(playerJson.playerId),
        PlayerNickname.create(playerJson.nickname),
        GameScore.create(playerJson.score),
        playerJson.streak,
        playerJson.isGuest
      );
      playersMap.set(playerJson.playerId, player);
    });

    // Convertir playersAnswers JSON a Map<QuestionId, MultiplayerQuestionResult>
    const answersMap = new Map<string, MultiplayerQuestionResult>();
    mongoDoc.playersAnswers.forEach((resultJson) => {
      const questionId = QuestionId.of(resultJson.questionId);

      // Convertir answers JSON a Map<PlayerId, MultiplayerAnswer>
      const answersMapForQuestion = new Map<string, MultiplayerAnswer>();
      resultJson.answers.forEach((answerJson) => {
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
      const questionResult = MultiplayerQuestionResult.fromMap(
        questionId,
        answersMapForQuestion
      );
      answersMap.set(resultJson.questionId, questionResult);
    });

    // Convertir leaderboard JSON a Leaderboard
    const leaderboardEntries: LeaderboardEntry[] = mongoDoc.leaderboard.map(
      (entryJson) =>
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
      mongoDoc.progress.previousQuestion
        ? new Optional<QuestionId>(
            QuestionId.of(mongoDoc.progress.previousQuestion)
          )
        : new Optional<QuestionId>(undefined),
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
