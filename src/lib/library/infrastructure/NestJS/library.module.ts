import { Module } from '@nestjs/common';
import { LibraryController } from './library.controller';
import { AddUserFavoriteQuizUseCase } from '../../application/AddUserFavoriteQuizUseCase';
import { DeleteUserFavoriteQuizUseCase } from '../../application/DeleteUserFavoriteQuizUseCase';
import { UserFavoriteQuizRepository } from "../../domain/port/UserFavoriteQuizRepository";
import { TypeOrmUserFavoriteQuizRepository } from '../TypeOrm/Repositories/TypeOrmUserFavoriteQuizRepository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmUserFavoriteQuizEntity } from '../TypeOrm/Entities/TypeOrmUserFavoriteQuizEntity';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmUserFavoriteQuizEntity])],
  controllers: [LibraryController],
  providers: [
    {
      provide: 'UserFavoriteQuizRepository',
      useClass: TypeOrmUserFavoriteQuizRepository,
    },
    {
      provide: 'AddUserFavoriteQuizUseCase',
      useFactory: (repository: UserFavoriteQuizRepository) =>
        new AddUserFavoriteQuizUseCase(repository),
      inject: ['UserFavoriteQuizRepository'],
    },
    {
      provide: 'DeleteUserFavoriteQuizUseCase',
      useFactory: (repository: UserFavoriteQuizRepository) =>
        new DeleteUserFavoriteQuizUseCase(repository),
      inject: ['UserFavoriteQuizRepository'],
    },
  ],

})
export class LibraryModule {}
