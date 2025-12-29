import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackofficeController } from './backoffice.controller';
import { SearchUsersUseCase } from '../../application/SearchUsersUseCase';
import { TypeOrmUserRepository } from '../TypeOrm/TypeOrmUserRepository';
import { TypeOrmUserEntity } from '../TypeOrm/TypeOrmUserEntity';


@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmUserEntity])],
  controllers: [BackofficeController],
  providers: [
    SearchUsersUseCase,
    {
      provide: 'UserRepository',
      useClass: TypeOrmUserRepository,
    },
  ],
  exports: [SearchUsersUseCase],
})
export class BackofficeModule {}
