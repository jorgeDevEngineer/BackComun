import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackofficeController } from './backoffice.controller';
import { SearchUsersUseCase } from '../../application/SearchUsersUseCase';
import { TypeOrmUserRepository } from '../TypeOrm/TypeOrmUserRepository';
import { TypeOrmUserEntity } from '../TypeOrm/TypeOrmUserEntity';
import { BlockUserUseCase } from '../../application/BlockUserUseCase';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmUserEntity])],
  controllers: [BackofficeController],
  providers: [
    SearchUsersUseCase,
    BlockUserUseCase,
    {
      provide: 'UserRepository',
      useClass: TypeOrmUserRepository,
    }
  ],
  exports: [SearchUsersUseCase, BlockUserUseCase],
})
export class BackofficeModule {}
