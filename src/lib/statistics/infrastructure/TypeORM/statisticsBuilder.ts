import { TypeOrmQuizEntity } from "src/lib/kahoot/infrastructure/TypeOrm/TypeOrmQuizEntity";
import { TypeOrmSinglePlayerGameEntity } from "src/lib/singlePlayerGame/infrastructure/TypeOrm/TypeOrmSinglePlayerGameEntity";
import { Repository, SelectQueryBuilder } from "typeorm";
import { CompletedQuizQueryCriteria } from "../../application/Response Types/CompletedQuizQueryCriteria";
import { CriteriaApplier } from "../../domain/port/CriteriaApplier";
import { TypeOrmQuizRepository } from "src/lib/kahoot/infrastructure/TypeOrm/TypeOrmQuizRepository";
import { TypeOrmSinglePlayerGameRepository } from "./Repositories/TypeOrmSinglePlayerGameRepository";
import { SinglePlayerGameRepository } from "../../domain/port/SinglePlayerRepository";
import { QuizRepository } from "src/lib/kahoot/domain/port/QuizRepository";

type DbType = 'postgres' | 'mongo';

export class StatisticsRepositoryBuilder {
  private quizRepo?: Repository<TypeOrmQuizEntity>;
  private singleGameRepo?: Repository<TypeOrmSinglePlayerGameEntity>;

  constructor(private readonly dbType: DbType) {}

  withQuizRepo(repo: Repository<TypeOrmQuizEntity>) {
    this.quizRepo = repo;
    return this;
  }

  withSinglePlayerGameRepo(repo: Repository<TypeOrmSinglePlayerGameEntity>) {
    this.singleGameRepo = repo;
    return this;
  }

  buildQuizRepository(): QuizRepository {
    if (this.dbType === 'postgres') {
      return new TypeOrmQuizRepository(this.quizRepo!, null);
    }
    throw new Error('Mongo QuizRepository no implementado aún');
  }

  buildSinglePlayerGameRepository(
    criteriaApplier: CriteriaApplier<SelectQueryBuilder<TypeOrmSinglePlayerGameEntity>, CompletedQuizQueryCriteria>
  ): SinglePlayerGameRepository {
    if (this.dbType === 'postgres') {
      return new TypeOrmSinglePlayerGameRepository(this.singleGameRepo!, criteriaApplier);
    }
    throw new Error('Mongo SinglePlayerGameRepository no implementado aún');
  }
}