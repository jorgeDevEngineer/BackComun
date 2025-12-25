import { Module } from '@nestjs/common';
import { LibraryController } from './library.controller';
import { AddUserFavoriteQuizCommandHanlder } from '../../application/Handlers/Commands/AddUserFavoriteQuizCommandHandler';
import { DeleteUserFavoriteQuizCommandHandler } from '../../application/Handlers/Commands/DeleteUserFavoriteQuizCommandHandler';
import { GetUserFavoriteQuizzesQueryHandler } from '../../application/Handlers/Querys/GetUserFavoriteQuizzesQueryHandler';
import { GetAllUserQuizzesQueryHandler } from '../../application/Handlers/Querys/GetAllUserQuizzesQueryHandler';
import { GetUserInProgressQuizzesQueryHandler} from '../../application/Handlers/Querys/GetUserInProgessQuizzesQueryHandler';
import { GetUserCompletedQuizzesQueryHandler } from '../../application/Handlers/Querys/GetUserCompletedQuizzesQueryHandler';
import { UserFavoriteQuizRepository } from "../../domain/port/UserFavoriteQuizRepository";
import { TypeOrmUserFavoriteQuizRepository } from '../TypeOrm/Repositories/TypeOrmUserFavoriteQuizRepository';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmUserFavoriteQuizEntity } from '../TypeOrm/Entities/TypeOrmUserFavoriteQuizEntity';
import { TypeOrmQuizEntity } from '../../../kahoot/infrastructure/TypeOrm/TypeOrmQuizEntity';
import { TypeOrmQuizRepository } from '../TypeOrm/Repositories/TypeOrmQuizRepository';
import { UserRepository } from '../../../user/domain/port/UserRepository';
import { TypeOrmUserEntity } from '../../../user/infrastructure/TypeOrm//TypeOrmUserEntity';
import { TypeOrmUserRepository } from '../../../user/infrastructure/TypeOrm/TypeOrmUserRepository';
import { SinglePlayerGameRepository} from '../../domain/port/SinglePlayerRepository';
import { TypeOrmSinglePlayerGameRepository } from '../TypeOrm/Repositories/TypeOrmSinglePlayerGameRepository';
import { TypeOrmSinglePlayerGameEntity } from "src/lib/singlePlayerGame/infrastructure/TypeOrm/TypeOrmSinglePlayerGameEntity";
import { QuizRepository } from '../../domain/port/QuizRepository';
import { CriteriaApplier } from '../../domain/port/CriteriaApplier';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { TypeOrmCriteriaApplier } from '../TypeOrm//Criteria Appliers/TypeOrmCriteriaApplier';
import { TypeOrmQuizCriteriaApplier } from '../TypeOrm/Criteria Appliers/TypeOrmAdvancedCriteriaApplier';
import { QuizQueryCriteria } from "../../application/Response Types/QuizQueryCriteria";
import { GetAllUserQuizzesDomainService } from '../../domain/services/Queries/GetAllUserQuizzesDomainService';
import { GetUserInProgressQuizzesDomainService } from '../../domain/services/Queries/GetUserInProgressQuizzesDomainService';
import { GetUserFavoriteQuizzesDomainService } from '../../domain/services/Queries/GetUserFavoriteQuizzesDomainService';
import { GetUserCompletedQuizzesDomainService } from '../../domain/services/Queries/GetUserCompletedQuizzesDomainService';
import { AddUserFavoriteQuizDomainService } from '../../domain/services/Commands/AddUserFavoriteQuizDomainService';
import { DeleteUserFavoriteQuizDomainService } from '../../domain/services/Commands/DeleteUserFavoriteQuizDomainService';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmUserFavoriteQuizEntity, TypeOrmQuizEntity, TypeOrmUserEntity, TypeOrmSinglePlayerGameEntity])],
  controllers: [LibraryController],
  providers: [
    {
      provide: 'CriteriaApplier',
      useClass: TypeOrmCriteriaApplier, // implementación genérica
    },
    {
      provide: 'AdvancedCriteriaApplier',
      useClass: TypeOrmQuizCriteriaApplier, // implementación avanzada
    },
    {
      provide: 'UserFavoriteQuizRepository',
      useFactory: (
        ormRepo: Repository<TypeOrmUserFavoriteQuizEntity>,
        criteriaApplier: CriteriaApplier<SelectQueryBuilder<TypeOrmUserFavoriteQuizEntity>, QuizQueryCriteria>,
      ) => new TypeOrmUserFavoriteQuizRepository(ormRepo, criteriaApplier),
      inject: [getRepositoryToken(TypeOrmUserFavoriteQuizEntity), 'CriteriaApplier'],
    },
    {
      provide: 'QuizRepository',
      useFactory: (
        ormRepo: Repository<TypeOrmQuizEntity>,
        advancedCriteriaApplier: CriteriaApplier<SelectQueryBuilder<TypeOrmQuizEntity>, QuizQueryCriteria>,
      ) => new TypeOrmQuizRepository(ormRepo, advancedCriteriaApplier),
      inject: [getRepositoryToken(TypeOrmQuizEntity), 'AdvancedCriteriaApplier'],
    },
    {
      provide: 'UserRepository',
      useClass: TypeOrmUserRepository,
    },
    {
      provide: 'SinglePlayerGameRepository',
      useFactory: (
        ormRepo: Repository<TypeOrmSinglePlayerGameEntity>,
        advancedCriteriaApplier: CriteriaApplier<SelectQueryBuilder<TypeOrmSinglePlayerGameEntity>, QuizQueryCriteria>
      ) => new TypeOrmSinglePlayerGameRepository(ormRepo, advancedCriteriaApplier),
      inject: [getRepositoryToken(TypeOrmSinglePlayerGameEntity), 'AdvancedCriteriaApplier'],
    },
    {
      provide: 'AddUserFavoriteQuizDomainService',
      useFactory: (userFavoriteRepository: UserFavoriteQuizRepository,
        quizRepository: QuizRepository,
        userRepository: UserRepository
      ) =>
        new AddUserFavoriteQuizDomainService(userFavoriteRepository, quizRepository, userRepository),
      inject: ['UserFavoriteQuizRepository', 'QuizRepository', 'UserRepository'],
    },
    {
      provide: 'AddUserFavoriteQuizCommandHandler',
      useFactory: (domainService: AddUserFavoriteQuizDomainService
      ) =>
        new AddUserFavoriteQuizCommandHanlder(domainService),
      inject: ['AddUserFavoriteQuizDomainService'],
    },
    {
      provide: 'DeleteUserFavoriteQuizDomainService',
      useFactory: (repository: UserFavoriteQuizRepository) =>
        new DeleteUserFavoriteQuizDomainService(repository),
      inject: ['UserFavoriteQuizRepository'],
    },
    {
      provide: 'DeleteUserFavoriteQuizCommandHandler',
      useFactory: (domainService: DeleteUserFavoriteQuizDomainService) =>
        new DeleteUserFavoriteQuizCommandHandler(domainService),
      inject: ['DeleteUserFavoriteQuizDomainService'],
    },
    {
      provide: 'GetUserFavoriteQuizzesDomainService',
      useFactory: (favoritesRepo: UserFavoriteQuizRepository,
        userRepo: UserRepository,
        quizRepo: QuizRepository) => new GetUserFavoriteQuizzesDomainService(favoritesRepo, quizRepo, userRepo),
      inject: ['UserFavoriteQuizRepository', 'UserRepository', 'QuizRepository'],
    },
    {
      provide: 'GetUserFavoriteQuizzesQueryHandler',
      useFactory: (domainService: GetUserFavoriteQuizzesDomainService,
      ) =>
        new GetUserFavoriteQuizzesQueryHandler(domainService),
      inject: ['GetUserFavoriteQuizzesDomainService'],
    },
    {
      provide: 'GetAllUserQuizzesDomainService',
      useFactory: (quizRepository: QuizRepository, userRepo: UserRepository) => 
        new GetAllUserQuizzesDomainService(quizRepository, userRepo),
      inject: ['QuizRepository', 'UserRepository'],
    },
    {
      provide: 'GetAllUserQuizzesQueryHandler',
      useFactory: (domainService: GetAllUserQuizzesDomainService) =>
        new GetAllUserQuizzesQueryHandler(domainService),
      inject: ['GetAllUserQuizzesDomainService'],
    },
    {
      provide: 'GetUserInProgressQuizzesDomainService',
      useFactory: (singlePlayerRepo: SinglePlayerGameRepository,
        quizRepo: QuizRepository,
        userRepo: UserRepository) =>
        new GetUserInProgressQuizzesDomainService(singlePlayerRepo, quizRepo, userRepo),
      inject: ['SinglePlayerGameRepository', 'QuizRepository', 'UserRepository'],
    },
    {
      provide: 'GetUserInProgressQuizzesQueryHandler',
      useFactory: ( domainService: GetUserInProgressQuizzesDomainService) =>
        new GetUserInProgressQuizzesQueryHandler(domainService),
      inject: ['GetUserInProgressQuizzesDomainService'],
    },
    {
      provide: 'GetUserCompletedQuizzesDomainService',
      useFactory: (quizRepository: QuizRepository,
        userRepo: UserRepository,
        singlePlayerRepo: SinglePlayerGameRepository) =>
        new GetUserCompletedQuizzesDomainService(quizRepository, userRepo, singlePlayerRepo),
      inject: ['QuizRepository', 'UserRepository', 'SinglePlayerGameRepository'],
    },
    {
      provide: 'GetUserCompletedQuizzesQueryHandler',
      useFactory: (domainService: GetUserCompletedQuizzesDomainService) => new GetUserCompletedQuizzesQueryHandler(domainService),
      inject: ['GetUserCompletedQuizzesDomainService'],
    },
  ],

})
export class LibraryModule {}
