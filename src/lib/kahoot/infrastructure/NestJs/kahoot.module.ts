import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { KahootController } from "./kahoots.controller";
import { CreateQuizUseCase } from "../../application/CreateQuizUseCase";
import { GetQuizUseCase } from "../../application/GetQuizUseCase";
import { ListUserQuizzesUseCase } from "../../application/ListUserQuizzesUseCase";
import { UpdateQuizUseCase } from "../../application/UpdateQuizUseCase";
import { DeleteQuizUseCase } from "../../application/DeleteQuizUseCase";
import { TypeOrmQuizRepository } from "../TypeOrm/TypeOrmQuizRepository";
import { QuizRepository } from "../../domain/port/QuizRepository";
import { LoggerModule } from "../../../shared/aspects/logger/infrastructure/logger.module";
import { ILoggerPort } from "../../../shared/aspects/logger/application/ports/logger.port";
import { LoggingUseCaseDecorator } from "../../../shared/aspects/logger/application/decorators/logging.decorator";
import { ErrorHandlingDecorator } from "../../../shared/aspects/error-handling/application/decorators/error-handling.decorator";
import { GetAllKahootsUseCase } from "../../application/GetAllKahootsUseCase";
import { DatabaseModule } from "../../../shared/infrastructure/database/database.module";
import { TypeOrmQuizEntity } from "../TypeOrm/TypeOrmQuizEntity";
import { AuthModule } from "../../../auth/infrastructure/NestJs/auth.module";
import { ITokenProvider } from "../../../auth/application/providers/ITokenProvider";
import { UserRepository } from "../../../user/domain/port/UserRepository";
import { TypeOrmUserEntity } from "../../../user/infrastructure/TypeOrm/TypeOrmUserEntity";
import { TypeOrmUserRepository } from "../../../user/infrastructure/TypeOrm/TypeOrmUserRepository";

@Module({
  imports: [
    LoggerModule,
    DatabaseModule,
    TypeOrmModule.forFeature([TypeOrmQuizEntity, TypeOrmUserEntity]),
    forwardRef(() => AuthModule),
  ],
  controllers: [KahootController],
  providers: [
    {
      provide: "UserRepository",
      useClass: TypeOrmUserRepository,
    },
    {
      provide: "QuizRepository",
      useClass: TypeOrmQuizRepository,
    },
    {
      provide: CreateQuizUseCase,
      useFactory: (
        logger: ILoggerPort,
        repo: QuizRepository,
        tokenProvider: ITokenProvider,
        userRepo: UserRepository
      ) => {
        const realUseCase = new CreateQuizUseCase(
          repo,
          tokenProvider,
          userRepo
        );
        const withErrorHandling = new ErrorHandlingDecorator(
          realUseCase,
          logger,
          "CreateQuizUseCase"
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "CreateQuizUseCase"
        );
      },
      inject: [
        "ILoggerPort",
        "QuizRepository",
        "ITokenProvider",
        "UserRepository",
      ],
    },
    {
      provide: GetQuizUseCase,
      useFactory: (
        logger: ILoggerPort,
        repo: QuizRepository,
        tokenProvider: ITokenProvider,
        userRepo: UserRepository
      ) => {
        const realUseCase = new GetQuizUseCase(repo, tokenProvider, userRepo);
        const withErrorHandling = new ErrorHandlingDecorator(
          realUseCase,
          logger,
          "GetQuizUseCase"
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "GetQuizUseCase"
        );
      },
      inject: [
        "ILoggerPort",
        "QuizRepository",
        "ITokenProvider",
        "UserRepository",
      ],
    },
    {
      provide: ListUserQuizzesUseCase,
      useFactory: (
        logger: ILoggerPort,
        repo: QuizRepository,
        tokenProvider: ITokenProvider,
        userRepo: UserRepository
      ) => {
        const realUseCase = new ListUserQuizzesUseCase(
          repo,
          tokenProvider,
          userRepo
        );
        const withErrorHandling = new ErrorHandlingDecorator(
          realUseCase,
          logger,
          "ListUserQuizzesUseCase"
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "ListUserQuizzesUseCase"
        );
      },
      inject: [
        "ILoggerPort",
        "QuizRepository",
        "ITokenProvider",
        "UserRepository",
      ],
    },
    {
      provide: UpdateQuizUseCase,
      useFactory: (
        logger: ILoggerPort,
        repo: QuizRepository,
        tokenProvider: ITokenProvider,
        userRepo: UserRepository
      ) => {
        const realUseCase = new UpdateQuizUseCase(
          repo,
          tokenProvider,
          userRepo
        );
        const withErrorHandling = new ErrorHandlingDecorator(
          realUseCase,
          logger,
          "UpdateQuizUseCase"
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "UpdateQuizUseCase"
        );
      },
      inject: [
        "ILoggerPort",
        "QuizRepository",
        "ITokenProvider",
        "UserRepository",
      ],
    },
    {
      provide: DeleteQuizUseCase,
      useFactory: (
        logger: ILoggerPort,
        repo: QuizRepository,
        tokenProvider: ITokenProvider,
        userRepo: UserRepository
      ) => {
        const realUseCase = new DeleteQuizUseCase(
          repo,
          tokenProvider,
          userRepo
        );
        const withErrorHandling = new ErrorHandlingDecorator(
          realUseCase,
          logger,
          "DeleteQuizUseCase"
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "DeleteQuizUseCase"
        );
      },
      inject: [
        "ILoggerPort",
        "QuizRepository",
        "ITokenProvider",
        "UserRepository",
      ],
    },
    {
      provide: GetAllKahootsUseCase,
      useFactory: (
        logger: ILoggerPort,
        repo: QuizRepository,
        tokenProvider: ITokenProvider,
        userRepo: UserRepository
      ) => {
        const realUseCase = new GetAllKahootsUseCase(
          repo,
          tokenProvider,
          userRepo
        );
        const withErrorHandling = new ErrorHandlingDecorator(
          realUseCase,
          logger,
          "GetAllKahootsUseCase"
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "GetAllKahootsUseCase"
        );
      },
      inject: [
        "ILoggerPort",
        "QuizRepository",
        "ITokenProvider",
        "UserRepository",
      ],
    },
  ],
  exports: ["QuizRepository", TypeOrmModule, "UserRepository"],
})
export class KahootModule {}
