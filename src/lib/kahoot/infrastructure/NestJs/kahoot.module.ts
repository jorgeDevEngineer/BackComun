
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KahootController } from './kahoots.controller';
import { CreateQuizUseCase } from '../../application/CreateQuizUseCase';
import { GetQuizUseCase } from '../../application/GetQuizUseCase';
import { ListUserQuizzesUseCase } from '../../application/ListUserQuizzesUseCase';
import { UpdateQuizUseCase } from '../../application/UpdateQuizUseCase';
import { DeleteQuizUseCase } from '../../application/DeleteQuizUseCase';
import { TypeOrmQuizEntity } from '../TypeOrm/TypeOrmQuizEntity';
import { TypeOrmQuizRepository } from '../TypeOrm/TypeOrmQuizRepository';
import { QuizRepository } from '../../domain/port/QuizRepository';
import { LoggerModule } from '../../../../aspects/logger/infrastructure/logger.module';
import { ILoggerPort } from '../../../../aspects/logger/domain/ports/logger.port';
import { LoggingUseCaseDecorator } from '../../../../aspects/logger/application/decorators/logging.decorator';
import { ErrorHandlingDecorator } from '../../../../aspects/error-handling/application/decorators/error-handling.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmQuizEntity]), LoggerModule],
  controllers: [KahootController],
  providers: [
    {
      provide: 'QuizRepository',
      useClass: TypeOrmQuizRepository,
    },
    {
      provide: CreateQuizUseCase,
      useFactory: (logger: ILoggerPort, repo: QuizRepository) => {
        const useCase = new CreateQuizUseCase(repo);
        const withErrorHandling = new ErrorHandlingDecorator(useCase, logger, 'CreateQuizUseCase');
        return new LoggingUseCaseDecorator(withErrorHandling, logger, 'CreateQuizUseCase');
      },
      inject: ['ILoggerPort', 'QuizRepository'],
    },
    {
      provide: GetQuizUseCase,
      useFactory: (logger: ILoggerPort, repo: QuizRepository) => {
        const useCase = new GetQuizUseCase(repo);
        const withErrorHandling = new ErrorHandlingDecorator(useCase, logger, 'GetQuizUseCase');
        return new LoggingUseCaseDecorator(withErrorHandling, logger, 'GetQuizUseCase');
      },
      inject: ['ILoggerPort', 'QuizRepository'],
    },
    {
      provide: ListUserQuizzesUseCase,
      useFactory: (logger: ILoggerPort, repo: QuizRepository) => {
        const useCase = new ListUserQuizzesUseCase(repo);
        const withErrorHandling = new ErrorHandlingDecorator(useCase, logger, 'ListUserQuizzesUseCase');
        return new LoggingUseCaseDecorator(withErrorHandling, logger, 'ListUserQuizzesUseCase');
      },
      inject: ['ILoggerPort', 'QuizRepository'],
    },
    {
      provide: UpdateQuizUseCase,
      useFactory: (logger: ILoggerPort, repo: QuizRepository) => {
        const useCase = new UpdateQuizUseCase(repo);
        const withErrorHandling = new ErrorHandlingDecorator(useCase, logger, 'UpdateQuizUseCase');
        return new LoggingUseCaseDecorator(withErrorHandling, logger, 'UpdateQuizUseCase');
      },
      inject: ['ILoggerPort', 'QuizRepository'],
    },
    {
      provide: DeleteQuizUseCase,
      useFactory: (logger: ILoggerPort, repo: QuizRepository) => {
        const useCase = new DeleteQuizUseCase(repo);
        const withErrorHandling = new ErrorHandlingDecorator(useCase, logger, 'DeleteQuizUseCase');
        return new LoggingUseCaseDecorator(withErrorHandling, logger, 'DeleteQuizUseCase');
      },
      inject: ['ILoggerPort', 'QuizRepository'],
    },
  ],
  exports: ['QuizRepository'],
})
export class KahootModule {}
