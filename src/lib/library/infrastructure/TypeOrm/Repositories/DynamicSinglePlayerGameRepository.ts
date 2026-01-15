import { InjectRepository } from "@nestjs/typeorm";
import { SinglePlayerGameRepository } from "../../../domain/port/SinglePlayerRepository";
import {
  MongoSinglePlayerGameDocument,
  TypeOrmSinglePlayerGameEntity,
} from "src/lib/singlePlayerGame/infrastructure/TypeOrm/TypeOrmSinglePlayerGameEntity";
import { Injectable } from "@nestjs/common";
import { SinglePlayerGame } from "src/lib/singlePlayerGame/domain/aggregates/SinglePlayerGame";
import {
  EvaluatedAnswer,
  GameProgress,
  GameProgressStatus,
  PlayerAnswer,
  QuestionResult,
} from "src/lib/singlePlayerGame/domain/valueObjects/SinglePlayerGameVOs";
import { GameScore } from "src/lib/shared/domain/valueObjects";
import { QuizId, UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { Repository, SelectQueryBuilder } from "typeorm";
import { CriteriaApplier } from "src/lib/library/domain/port/CriteriaApplier";
import { QuizQueryCriteria } from "src/lib/library/application/Response Types/QuizQueryCriteria";
import { MongoFindParams } from "../Criteria Appliers/Mongo/MongoAdvancedCriteriaApplier";
import { DynamicMongoAdapter } from "src/lib/shared/infrastructure/database/dynamic-mongo.adapter";
import { ObjectId, Collection, Db } from "mongodb";
import { Optional } from "src/lib/shared/Type Helpers/Optional";
import { QuestionId } from "src/lib/kahoot/domain/valueObject/Question";
import { SinglePlayerGameId } from "src/lib/shared/domain/ids";
import { MongoCriteriaApplier } from "../Criteria Appliers/Mongo/MongoCriteriaApplier";

@Injectable()
export class DynamicSinglePlayerGameRepository
  implements SinglePlayerGameRepository
{
  constructor(
    @InjectRepository(TypeOrmSinglePlayerGameEntity)
    private readonly gameRepo: Repository<TypeOrmSinglePlayerGameEntity>,
    private readonly pgCriteriaApplier: CriteriaApplier<
      SelectQueryBuilder<TypeOrmSinglePlayerGameEntity>,
      QuizQueryCriteria
    >,
    private readonly mongoAdapter: DynamicMongoAdapter,
    private readonly mongoCriteriaApplier: MongoCriteriaApplier<MongoSinglePlayerGameDocument>
  ) {}

  private async getMongoCollection(): Promise<
    Collection<MongoSinglePlayerGameDocument>
  > {
    const db: Db = await this.mongoAdapter.getConnection("asyncgame");
    return db.collection<MongoSinglePlayerGameDocument>("attempts");
  }

  async findInProgressGames(
    playerId: UserId,
    criteria: QuizQueryCriteria
  ): Promise<[SinglePlayerGame[], number]> {
    try {
      // 🔑 Intentar Mongo primero
      const collection = await this.getMongoCollection();

      const params: MongoFindParams<any> = {
        filter: {
          playerId: playerId.getValue(),
          status: GameProgressStatus.IN_PROGRESS,
        },
      };

      const { filter, options } = this.mongoCriteriaApplier.apply(
        params,
        criteria
      );

      console.log("Mongo filter:", filter);

      const docs = await collection
        .find(filter, options)
        .sort({ startedAt: -1 })
        .toArray();

      return [docs.map((doc) => this.mapMongoToDomain(doc)), docs.length];
    } catch {
      // 🔑 Fallback a Postgres
      console.log("Falling back to Postgres for in-progress games");
      let qb = this.gameRepo.createQueryBuilder("game");
      qb.where("game.playerId = :playerId", {
        playerId: playerId.getValue(),
      }).andWhere("game.status = :status", {
        status: GameProgressStatus.IN_PROGRESS,
      });

      qb = this.pgCriteriaApplier.apply(qb, criteria, "game");

      const [entities, totalCount] = await qb.getManyAndCount();
      return [entities.map((entity) => entity.toDomain()), totalCount];
    }
  }

  async findCompletedGames(
    playerId: UserId,
    criteria: QuizQueryCriteria
  ): Promise<[SinglePlayerGame[], number]> {
    try {
      // 🔑 Intentar Mongo primero
      const collection = await this.getMongoCollection();

      console.log("MongoDB llega");

      const params: MongoFindParams<any> = {
        filter: {
          playerId: playerId.getValue(),
          status: GameProgressStatus.COMPLETED,
        },
      };

      const { filter, options } = this.mongoCriteriaApplier.apply(
        params,
        criteria
      );
      const docs = await collection
        .find(filter, options)
        .sort({ startedAt: -1 })
        .toArray();

      return [docs.map((doc) => this.mapMongoToDomain(doc)), docs.length];
    } catch {
      // 🔑 Fallback a Postgres
      console.log("Falling back to Postgres for completed games");
      let qb = this.gameRepo.createQueryBuilder("game");
      qb.where("game.playerId = :playerId", {
        playerId: playerId.getValue(),
      }).andWhere("game.status = :status", {
        status: GameProgressStatus.COMPLETED,
      });

      qb = this.pgCriteriaApplier.apply(qb, criteria, "game");
      qb.orderBy("game.startedAt", "DESC");

      const [entities, totalCount] = await qb.getManyAndCount();
      return [entities.map((entity) => entity.toDomain()), totalCount];
    }
  }

  private mapMongoToDomain(
    mongoDoc: MongoSinglePlayerGameDocument
  ): SinglePlayerGame {
    const questionResults: QuestionResult[] = mongoDoc.questionResults.map(
      (questionResultJson) => {
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
      }
    );

    return SinglePlayerGame.fromDb(
      SinglePlayerGameId.of(mongoDoc._id),
      QuizId.of(mongoDoc.quizId),
      mongoDoc.totalQuestions,
      UserId.of(mongoDoc.playerId),
      GameProgress.create(mongoDoc.progress),
      GameScore.create(mongoDoc.score),
      new Date(mongoDoc.startedAt),
      new Optional<Date>(
        mongoDoc.completedAt ? new Date(mongoDoc.completedAt) : undefined
      ),
      questionResults
    );
  }
}
