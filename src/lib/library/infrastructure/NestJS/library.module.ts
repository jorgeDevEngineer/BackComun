import { Module } from '@nestjs/common';
import { LibraryController } from './library.controller';
import { AddUserFavoriteQuizUseCase } from '../../application/AddUserFavoriteQuizUseCase';
import { DeleteUserFavoriteQuizUseCase } from '../../application/DeleteUserFavoriteQuizUseCase';
import { GetUserFavoriteQuizzesUseCase } from '../../application/GetUserFavoriteQuizzesUseCase';
import { UserFavoriteQuizRepository } from "../../domain/port/UserFavoriteQuizRepository";
import { TypeOrmUserFavoriteQuizRepository } from '../TypeOrm/Repositories/TypeOrmUserFavoriteQuizRepository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmUserFavoriteQuizEntity } from '../TypeOrm/Entities/TypeOrmUserFavoriteQuizEntity';
import { TypeOrmQuizEntity } from '../../../kahoot/infrastructure/TypeOrm/TypeOrmQuizEntity';
import { TypeOrmQuizRepository } from '../TypeOrm/Repositories/TypeOrmQuizRepository';
import { UserRepository } from '../../../user/domain/port/UserRepository';
import { TypeOrmUserEntity } from '../../../user/infrastructure/TypeOrm//TypeOrmUserEntity';
import { TypeOrmUserRepository } from '../../../user/infrastructure/TypeOrm/TypeOrmUserRepository';
import { QuizRepository } from '../../domain/port/QuizRepository';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmUserFavoriteQuizEntity, TypeOrmQuizEntity, TypeOrmUserEntity])],
  controllers: [LibraryController],
  providers: [
    {
      provide: 'UserFavoriteQuizRepository',
      useClass: TypeOrmUserFavoriteQuizRepository,
    },
    {
      provide: 'QuizRepository',
      useClass: TypeOrmQuizRepository,
    },
    {
      provide: 'UserRepository',
      useClass: TypeOrmUserRepository,
    },
    {
      provide: 'AddUserFavoriteQuizUseCase',
      useFactory: (userFavoriteRepository: UserFavoriteQuizRepository,
        quizRepository: QuizRepository
      ) =>
        new AddUserFavoriteQuizUseCase(userFavoriteRepository, quizRepository),
      inject: ['UserFavoriteQuizRepository', 'QuizRepository'],
    },
    {
      provide: 'DeleteUserFavoriteQuizUseCase',
      useFactory: (repository: UserFavoriteQuizRepository) =>
        new DeleteUserFavoriteQuizUseCase(repository),
      inject: ['UserFavoriteQuizRepository'],
    },
    {
      provide: 'GetUserFavoriteQuizzesUseCase',
      useFactory: (favoritesRepo: UserFavoriteQuizRepository,
        quizRepo: QuizRepository,
        userRepo: UserRepository
      ) =>
        new GetUserFavoriteQuizzesUseCase(favoritesRepo, quizRepo, userRepo),
      inject: ['UserFavoriteQuizRepository', 'QuizRepository', 'UserRepository'],
    },
  ],

})
export class LibraryModule {}
