import { TypeOrmQuizEntity } from "src/lib/kahoot/infrastructure/TypeOrm/TypeOrmQuizEntity";
import { TypeOrmUserEntity } from "../../../user/infrastructure/TypeOrm/TypeOrmUserEntity";
import { TypeOrmUserRepository } from "../../../user/infrastructure/TypeOrm/TypeOrmUserRepository";
import { TypeOrmSinglePlayerGameEntity } from "src/lib/singlePlayerGame/infrastructure/TypeOrm/TypeOrmSinglePlayerGameEntity";
import { Repository, SelectQueryBuilder } from "typeorm";
import { QuizQueryCriteria } from "../../application/Response Types/QuizQueryCriteria";
import { CriteriaApplier } from "../../domain/port/CriteriaApplier";
import { TypeOrmUserFavoriteQuizEntity } from "./Entities/TypeOrmUserFavoriteQuizEntity";
import { TypeOrmQuizRepository } from "./Repositories/TypeOrmQuizRepository";
import { TypeOrmSinglePlayerGameRepository } from "./Repositories/TypeOrmSinglePlayerGameRepository";
import { TypeOrmUserFavoriteQuizRepository } from "./Repositories/TypeOrmUserFavoriteQuizRepository";
import { UserFavoriteQuizRepository } from "../../domain/port/UserFavoriteQuizRepository";
import { QuizRepository } from "../../domain/port/QuizRepository";
import { UserRepository } from "src/lib/user/domain/port/UserRepository";
import { SinglePlayerGameRepository } from "../../domain/port/SinglePlayerRepository";

type DbType = 'postgres' | 'mongo';

export class LibraryRepositoryBuilder {
  private quizRepo?: Repository<TypeOrmQuizEntity>;
  private userRepo?: Repository<TypeOrmUserEntity>;
  private userFavRepo?: Repository<TypeOrmUserFavoriteQuizEntity>;
  private singleGameRepo?: Repository<TypeOrmSinglePlayerGameEntity>;

  constructor(private readonly dbType: DbType) {}

  withQuizRepo(repo: Repository<TypeOrmQuizEntity>) {
    this.quizRepo = repo;
    return this;
  }

  withUserRepo(repo: Repository<TypeOrmUserEntity>) {
    this.userRepo = repo;
    return this;
  }

  withUserFavoriteRepo(repo: Repository<TypeOrmUserFavoriteQuizEntity>) {
    this.userFavRepo = repo;
    return this;
  }

  withSinglePlayerGameRepo(repo: Repository<TypeOrmSinglePlayerGameEntity>) {
    this.singleGameRepo = repo;
    return this;
  }

  buildUserFavoriteQuizRepository(
    criteriaApplier: CriteriaApplier<SelectQueryBuilder<TypeOrmUserFavoriteQuizEntity>, QuizQueryCriteria>
  ): UserFavoriteQuizRepository {
    if (this.dbType === 'postgres') {
      return new TypeOrmUserFavoriteQuizRepository(this.userFavRepo!, criteriaApplier);
    }
    throw new Error('Mongo UserFavoriteQuizRepository no implementado aún');
  }

  buildQuizRepository(
    advancedCriteriaApplier: CriteriaApplier<SelectQueryBuilder<TypeOrmQuizEntity>, QuizQueryCriteria>
  ): QuizRepository {
    if (this.dbType === 'postgres') {
      return new TypeOrmQuizRepository(this.quizRepo!, advancedCriteriaApplier);
    }
    throw new Error('Mongo QuizRepository no implementado aún');
  }

  buildUserRepository(): UserRepository {
    if (this.dbType === 'postgres') {
      return new TypeOrmUserRepository(this.userRepo!);
    }
    throw new Error('Mongo UserRepository no implementado aún');
  }

  buildSinglePlayerGameRepository(
    advancedCriteriaApplier: CriteriaApplier<SelectQueryBuilder<TypeOrmSinglePlayerGameEntity>, QuizQueryCriteria>
  ): SinglePlayerGameRepository {
    if (this.dbType === 'postgres') {
      return new TypeOrmSinglePlayerGameRepository(this.singleGameRepo!, advancedCriteriaApplier);
    }
    throw new Error('Mongo SinglePlayerGameRepository no implementado aún');
  }
}