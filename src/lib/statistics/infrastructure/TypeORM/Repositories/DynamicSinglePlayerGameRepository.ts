import { InjectRepository } from "@nestjs/typeorm";
import { SinglePlayerGameRepository } from "../../../domain/port/SinglePlayerRepository";
import { TypeOrmSinglePlayerGameEntity } from "src/lib/singlePlayerGame/infrastructure/TypeOrm/TypeOrmSinglePlayerGameEntity";
import { Injectable } from "@nestjs/common";
import { SinglePlayerGame } from "src/lib/singlePlayerGame/domain/aggregates/SinglePlayerGame";
import {
  EvaluatedAnswer,
  GameProgress,
  GameProgressStatus,
  PlayerAnswer,
  QuestionResult,
} from "src/lib/singlePlayerGame/domain/valueObjects/SinglePlayerGameVOs";
import { SinglePlayerGameId } from "src/lib/shared/domain/ids";
import { QuizId, UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { Repository } from "typeorm";
import { CompletedQuizQueryCriteria } from "src/lib/statistics/application/Response Types/CompletedQuizQueryCriteria";
import { DynamicMongoAdapter } from "src/lib/shared/infrastructure/database/dynamic-mongo.adapter";
import { TypeOrmPostgresCriteriaApplier } from "../Criteria Appliers/Postgres/TypeOrmPostgresCriteriaApplier";
import {
  MongoCriteriaApplier,
  MongoFindParams,
} from "../Criteria Appliers/Mongo/MongoCriteriaApplier";
import { Collection, Db, ObjectId } from "mongodb";
import { GameScore } from "src/lib/shared/domain/valueObjects";
import { QuestionId } from "src/lib/kahoot/domain/valueObject/Question";
import { Optional } from "src/lib/shared/Type Helpers/Optional";
import { MongoSinglePlayerGameDocument } from "../../../../singlePlayerGame/infrastructure/TypeOrm/TypeOrmSinglePlayerGameEntity";

@Injectable()
export class DynamicSinglePlayerGameRepository
  implements SinglePlayerGameRepository
{
  constructor(
    @InjectRepository(TypeOrmSinglePlayerGameEntity)
    private readonly gameRepo: Repository<TypeOrmSinglePlayerGameEntity>,
    private readonly pgCriteriaApplier: TypeOrmPostgresCriteriaApplier<TypeOrmSinglePlayerGameEntity>,
    private readonly mongoAdapter: DynamicMongoAdapter,
    private readonly mongoCriteriaApplier: MongoCriteriaApplier<MongoSinglePlayerGameDocument>
  ) {}

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

  private async getMongoCollection(): Promise<
    Collection<MongoSinglePlayerGameDocument>
  > {
    const db: Db = await this.mongoAdapter.getConnection("asyncgame");
    return db.collection<MongoSinglePlayerGameDocument>("attempts");
  }

  async findCompletedGames(
    playerId: UserId,
    criteria: CompletedQuizQueryCriteria
  ): Promise<{ games: SinglePlayerGame[]; totalGames: number } | null> {
    try {
      const collection = await this.getMongoCollection();

      // Filtro Base
      const baseFilter: MongoFindParams<any> = {
        filter: {
          playerId: playerId.value,
          status: GameProgressStatus.COMPLETED,
        },
      };

      console.log("MongoDB llega a singlePlayer");

      // Aplicar Criterios
      const { filter, options } = this.mongoCriteriaApplier.apply(
        baseFilter,
        criteria
      );

      // Ejecutar Consulta
      const results = await collection.find(filter, options).toArray();

      const domainData = results.map((doc) => this.mapMongoToDomain(doc));

      return { games: domainData, totalGames: results.length };
    } catch (error) {
      console.log("MongoDB query failed, falling back to Postgres:");
      console.log(playerId.value);
      let qb = this.gameRepo.createQueryBuilder("asyncgame");
      qb.where("asyncgame.playerId = :playerId", {
        playerId: playerId.getValue(),
      }).andWhere("asyncgame.status = :status", {
        status: GameProgressStatus.COMPLETED,
      });

      qb = this.pgCriteriaApplier.apply(qb, criteria, "asyncgame");

      const entities = await qb.getMany();
      const totalCount = await this.gameRepo.count();
      const domainData = entities.map((entity) => entity.toDomain());
      return { games: domainData, totalGames: totalCount };
    }
  }

  async findById(gameId: SinglePlayerGameId): Promise<SinglePlayerGame | null> {
    try {
      const collection = await this.getMongoCollection();
      const id = gameId.getId();
      const doc = await collection.findOne({ id: id });
      return doc ? this.mapMongoToDomain(doc) : null;
    } catch (error) {
      console.log("MongoDB Failed, fallbak to postgres");
      const entity = await this.gameRepo.findOne({
        where: { gameId: gameId.getId() },
      });
      return entity ? entity.toDomain() : null;
    }
  }
}
