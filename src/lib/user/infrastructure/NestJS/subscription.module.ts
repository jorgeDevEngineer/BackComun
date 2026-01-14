import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserSubscriptionController } from "./subscription.controller";
import { TypeOrmUserEntity } from "../TypeOrm/TypeOrmUserEntity";
import { TypeOrmUserRepository } from "../TypeOrm/TypeOrmUserRepository";
import { GetOneUserByIdQueryHandler } from "../../application/Handlers/Querys/GetOneUserByIdQueryHandler";
import { EnablePremiumMembershipCommandHandler } from "../../application/Handlers/Commands/EnablePremiumMembershipCommandHandler";
import { EnableFreeMembershipCommandHandler } from "../../application/Handlers/Commands/EnableFreeMembershipCommandHandler";
import { ErrorHandlingDecorator } from "src/lib/shared/aspects/error-handling/application/decorators/error-handling.decorator";
import { LoggingUseCaseDecorator } from "src/lib/shared/aspects/logger/application/decorators/logging.decorator";
import { AuthorizationDecorator } from "src/lib/shared/aspects/auth/application/decorators/authorization.decorator";
import {
  ILoggerPort,
  LOGGER_PORT,
} from "src/lib/shared/aspects/logger/domain/ports/logger.port";
import { LoggerModule } from "src/lib/shared/aspects/logger/infrastructure/logger.module";
import { AuthAspectModule } from "src/lib/shared/aspects/auth/infrastructure/auth.module";
import { AuthModule } from "src/lib/auth/infrastructure/NestJs/auth.module";
import { UserModule } from "./user.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([TypeOrmUserEntity]),
    forwardRef(() => AuthModule),
    LoggerModule,
    AuthAspectModule,
    // Import UserModule to reuse exported handlers/providers (e.g., GetOneUserById)
    UserModule,
  ],
  controllers: [UserSubscriptionController],
  providers: [
    {
      provide: EnablePremiumMembershipCommandHandler,
      useFactory: (logger: ILoggerPort, repository: TypeOrmUserRepository) => {
        const useCase = new EnablePremiumMembershipCommandHandler(repository);
        const withErrorHandling = new ErrorHandlingDecorator(
          useCase,
          logger,
          "EnablePremiumMembershipCommandHandler"
        );
        const withLogging = new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "EnablePremiumMembershipCommandHandler"
        );
        return new AuthorizationDecorator(withLogging);
      },
      inject: [LOGGER_PORT, "UserRepository"],
    },
    {
      provide: EnableFreeMembershipCommandHandler,
      useFactory: (logger: ILoggerPort, repository: TypeOrmUserRepository) => {
        const useCase = new EnableFreeMembershipCommandHandler(repository);
        const withErrorHandling = new ErrorHandlingDecorator(
          useCase,
          logger,
          "EnableFreeMembershipCommandHandler"
        );
        const withLogging = new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "EnableFreeMembershipCommandHandler"
        );
        return new AuthorizationDecorator(withLogging);
      },
      inject: [LOGGER_PORT, "UserRepository"],
    },
  ],
})
export class UserSubscriptionModule {}
