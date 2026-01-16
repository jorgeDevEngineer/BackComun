import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BackofficeController } from "./backoffice.controller";

// Casos de uso
import { SearchUsersUseCase } from "../../application/SearchUsersUseCase";
import { BlockUserUseCase } from "../../application/BlockUserUseCase";
import { DeleteUserUseCase } from "../../application/DeleteUserUseCase";
import { SendNotificationUseCase } from "../../application/SendNotificationUseCase";
import { UnblockUserUseCase } from "../../application/UnblockUserUseCase";
import { GiveAdminRoleUseCase } from "../../application/GiveAdminUseCase";
import { RemoveAdminRoleUseCase } from "../../application/RemoveAdminUseCase";
import { GetNotificationsUseCase } from "../../application/GetNotificationUseCase";

// Decoradores
import { ErrorHandlingDecorator } from "src/lib/shared/aspects/error-handling/application/decorators/error-handling.decorator";
import { LoggingUseCaseDecorator } from "src/lib/shared/aspects/logger/application/decorators/logging.decorator";

// Puertos
import { ILoggerPort } from "src/lib/shared/aspects/logger/application/ports/logger.port";
import { UserRepository } from "../../domain/port/UserRepository";
import { MassiveNotificationRepository } from "../../domain/port/MassiveNotificationRepository";
import { SendMailService } from "../../domain/port/SendMailService";
import { ITokenProvider } from "src/lib/auth/application/providers/ITokenProvider";

// Repositorios e infraestructura
import { TypeOrmUserRepository } from "../TypeOrm/TypeOrmUserRepository";
import { TypeOrmUserEntity } from "../TypeOrm/TypeOrmUserEntity";
import { TypeOrmMassiveNotificationRepository } from "../TypeOrm/TypeOrmMassiveNotificationRepository";
import { TypeOrmMassiveNotificationEntity } from "../TypeOrm/TypeOrmMassiveNotificationEntity";
import { SMTPSendMailService } from "../SMTP/SMTPSendMailService";
import { AssetUrlResolver } from "src/lib/shared/infrastructure/providers/AssetUrlResolver";
import { AuthModule } from "src/lib/auth/infrastructure/NestJs/auth.module";
import { LoggerModule } from "src/lib/shared/aspects/logger/infrastructure/logger.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TypeOrmUserEntity,
      TypeOrmMassiveNotificationEntity,
    ]),
    forwardRef(() => AuthModule),
    LoggerModule,
  ],
  controllers: [BackofficeController],
  providers: [
    // Repositorios
    {
      provide: "UserRepository",
      useClass: TypeOrmUserRepository,
    },
    {
      provide: "MassiveNotificationRepository",
      useClass: TypeOrmMassiveNotificationRepository,
    },
    {
      provide: "IAssetUrlResolver",
      useClass: AssetUrlResolver,
    },
    {
      provide: "SendMailService",
      useClass: SMTPSendMailService,
    },

    // SearchUsersUseCase con decoradores
    {
      provide: SearchUsersUseCase,
      useFactory: (
        logger: ILoggerPort,
        userRepo: UserRepository,
        tokenProvider: ITokenProvider
      ) => {
        const useCase = new SearchUsersUseCase(userRepo, tokenProvider);
        const withErrorHandling = new ErrorHandlingDecorator(
          useCase,
          logger,
          "SearchUsersUseCase"
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "SearchUsersUseCase"
        );
      },
      inject: ["ILoggerPort", "UserRepository", "ITokenProvider"],
    },

    // BlockUserUseCase con decoradores
    {
      provide: BlockUserUseCase,
      useFactory: (
        logger: ILoggerPort,
        userRepo: UserRepository,
        tokenProvider: ITokenProvider
      ) => {
        const useCase = new BlockUserUseCase(userRepo, tokenProvider);
        const withErrorHandling = new ErrorHandlingDecorator(
          useCase,
          logger,
          "BlockUserUseCase"
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "BlockUserUseCase"
        );
      },
      inject: ["ILoggerPort", "UserRepository", "ITokenProvider"],
    },

    // UnblockUserUseCase con decoradores
    {
      provide: UnblockUserUseCase,
      useFactory: (
        logger: ILoggerPort,
        userRepo: UserRepository,
        tokenProvider: ITokenProvider
      ) => {
        const useCase = new UnblockUserUseCase(userRepo, tokenProvider);
        const withErrorHandling = new ErrorHandlingDecorator(
          useCase,
          logger,
          "UnblockUserUseCase"
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "UnblockUserUseCase"
        );
      },
      inject: ["ILoggerPort", "UserRepository", "ITokenProvider"],
    },

    // DeleteUserUseCase con decoradores
    {
      provide: DeleteUserUseCase,
      useFactory: (
        logger: ILoggerPort,
        userRepo: UserRepository,
        tokenProvider: ITokenProvider
      ) => {
        const useCase = new DeleteUserUseCase(userRepo, tokenProvider);
        const withErrorHandling = new ErrorHandlingDecorator(
          useCase,
          logger,
          "DeleteUserUseCase"
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "DeleteUserUseCase"
        );
      },
      inject: ["ILoggerPort", "UserRepository", "ITokenProvider"],
    },

    // GiveAdminRoleUseCase con decoradores
    {
      provide: GiveAdminRoleUseCase,
      useFactory: (
        logger: ILoggerPort,
        userRepo: UserRepository,
        tokenProvider: ITokenProvider
      ) => {
        const useCase = new GiveAdminRoleUseCase(userRepo, tokenProvider);
        const withErrorHandling = new ErrorHandlingDecorator(
          useCase,
          logger,
          "GiveAdminRoleUseCase"
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "GiveAdminRoleUseCase"
        );
      },
      inject: ["ILoggerPort", "UserRepository", "ITokenProvider"],
    },

    // RemoveAdminRoleUseCase con decoradores
    {
      provide: RemoveAdminRoleUseCase,
      useFactory: (
        logger: ILoggerPort,
        userRepo: UserRepository,
        tokenProvider: ITokenProvider
      ) => {
        const useCase = new RemoveAdminRoleUseCase(userRepo, tokenProvider);
        const withErrorHandling = new ErrorHandlingDecorator(
          useCase,
          logger,
          "RemoveAdminRoleUseCase"
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "RemoveAdminRoleUseCase"
        );
      },
      inject: ["ILoggerPort", "UserRepository", "ITokenProvider"],
    },

    // SendNotificationUseCase con decoradores
    {
      provide: SendNotificationUseCase,
      useFactory: (
        logger: ILoggerPort,
        notificationRepo: MassiveNotificationRepository,
        userRepo: UserRepository,
        sendMailService: SendMailService,
        tokenProvider: ITokenProvider
      ) => {
        const useCase = new SendNotificationUseCase(
          notificationRepo,
          userRepo,
          sendMailService,
          tokenProvider
        );
        const withErrorHandling = new ErrorHandlingDecorator(
          useCase,
          logger,
          "SendNotificationUseCase"
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "SendNotificationUseCase"
        );
      },
      inject: [
        "ILoggerPort",
        "MassiveNotificationRepository",
        "UserRepository",
        "SendMailService",
        "ITokenProvider",
      ],
    },

    // GetNotificationsUseCase con decoradores
    {
      provide: GetNotificationsUseCase,
      useFactory: (
        logger: ILoggerPort,
        notificationRepo: MassiveNotificationRepository,
        userRepo: UserRepository,
        tokenProvider: ITokenProvider
      ) => {
        const useCase = new GetNotificationsUseCase(
          notificationRepo,
          userRepo,
          tokenProvider
        );
        const withErrorHandling = new ErrorHandlingDecorator(
          useCase,
          logger,
          "GetNotificationsUseCase"
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "GetNotificationsUseCase"
        );
      },
      inject: [
        "ILoggerPort",
        "MassiveNotificationRepository",
        "UserRepository",
        "ITokenProvider",
      ],
    },
  ],
  exports: [
    SearchUsersUseCase,
    BlockUserUseCase,
    DeleteUserUseCase,
    SendNotificationUseCase,
    UnblockUserUseCase,
    GiveAdminRoleUseCase,
    RemoveAdminRoleUseCase,
    GetNotificationsUseCase,
  ],
})
export class BackofficeModule {}
