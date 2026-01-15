
import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { GroupsController } from "./Group.controller";

import { GroupOrmEntity } from "../TypeOrm/GroupOrmEntity";
import { GroupMemberOrmEntity } from "../TypeOrm/GroupOrnMember";
import { GroupQuizAssignmentOrmEntity } from "../TypeOrm/GroupQuizAssigmentOrmEntity";
import { TypeOrmQuizEntity } from "../../../kahoot/infrastructure/TypeOrm/TypeOrmQuizEntity";
import { TypeOrmSinglePlayerGameEntity } from "src/lib/singlePlayerGame/infrastructure/TypeOrm/TypeOrmSinglePlayerGameEntity";

import { TypeOrmGroupRepository } from "../TypeOrm/TypeOrmGroupRepository";
import { TypeOrmQuizReadService } from "../TypeOrm/QuizReadServiceImplementation";
import { cryptoInvitationTokenGenerator } from "../Token/InvitationTokenGenerator";

import { GroupRepository } from "../../domain/port/GroupRepository";
import { InvitationTokenGenerator } from "../../domain/port/GroupInvitationTokenGenerator";
import { QuizReadService } from "../../domain/port/QuizReadService";

import { CreateGroupCommandHandler } from "../../application/Handlers/commands/CreateGroupCommandHandler";
import { UpdateGroupDetailsCommandHandler } from "../../application/Handlers/commands/UpdateGroupDetailsCommandHandler";
import { JoinGroupByInvitationCommandHandler } from "../../application/Handlers/commands/JoinGroupByInvitationCommandHandler";
import { GenerateGroupInvitationCommandHandler } from "../../application/Handlers/commands/GenerateGroupInvitationCommandHandler";
import { LeaveGroupCommandHandler } from "../../application/Handlers/commands/LeaveGroupCommandHandler";
import { RemoveGroupMemberCommandHandler } from "../../application/Handlers/commands/RemoveGroupMemberCommandHandler";
import { TransferGroupAdminCommandHandler } from "../../application/Handlers/commands/TransferGroupAdminCommandHandler";
import { AssignQuizToGroupCommandHandler } from "../../application/Handlers/commands/AssignQuizToGroupCommandHandler";
import { GetUserGroupsQueryHandler } from "../../application/Handlers/queries/GetUserGroupsQueryHandler";
import { GetGroupMembersQueryHandler } from "../../application/Handlers/queries/GetGroupMembersQueryHandler";
import { GetGroupDetailsQueryHandler } from "../../application/Handlers/queries/GetGroupDetailsQueryHandler";
import { GetGroupQuizzesQueryHandler } from "../../application/Handlers/queries/GetGroupQuizzesQueryHandler";
import { GetGroupLeaderboardQueryHandler } from "../../application/Handlers/queries/GetGroupLeaderboardQUeryHandler";
import { GetGroupQuizLeaderboardQueryHandler } from "../../application/Handlers/queries/GetGroupQuizLeaderboardQueryHandler";

import { LoggerModule } from "src/lib/shared/aspects/logger/infrastructure/logger.module";
import { LoggingUseCaseDecorator } from "src/lib/shared/aspects/logger/application/decorators/logging.decorator";
import { ILoggerPort, LOGGER_PORT } from "src/lib/shared/aspects/logger/domain/ports/logger.port";
import { ErrorHandlingDecoratorWithEither } from "src/lib/shared/aspects/error-handling/application/decorators/error-handling-either";
import { EventEmitter2, EventEmitterModule } from "@nestjs/event-emitter";
import { AuthModule } from "src/lib/auth/infrastructure/NestJs/auth.module";
import { QuizRepository } from "src/lib/kahoot/domain/port/QuizRepository";
import { SinglePlayerGameRepository } from "src/lib/singlePlayerGame/domain/repositories/SinglePlayerGameRepository";
import { SinglePlayerGameModule } from "src/lib/singlePlayerGame/infrastructure/NestJs/SinglePlayerGame.module";
import { KahootModule } from "src/lib/kahoot/infrastructure/NestJs/kahoot.module";
import { UserModule } from "src/lib/user/infrastructure/NestJS/user.module";
import { UserRepository } from "src/lib/user/domain/port/UserRepository";

@Module({
  imports: [
    LoggerModule, 
    EventEmitterModule.forRoot(),
    TypeOrmModule.forFeature([
      GroupOrmEntity,
      GroupMemberOrmEntity,
      GroupQuizAssignmentOrmEntity,
      TypeOrmQuizEntity,
      TypeOrmSinglePlayerGameEntity,
      
    ]),
    forwardRef(() => AuthModule),
    SinglePlayerGameModule,
    KahootModule,
    UserModule
  ],
  controllers: [GroupsController],
  providers: [
    {
      provide: "GroupRepository",
      useClass: TypeOrmGroupRepository,
    },
    {
      provide: "InvitationTokenGenerator",
      useValue: cryptoInvitationTokenGenerator,
    },
    {
      provide: "QuizReadService",
      useClass: TypeOrmQuizReadService,
    },
    {
      provide: CreateGroupCommandHandler,
      useFactory: (logger: ILoggerPort, repo: GroupRepository) => {
        const useCase = new CreateGroupCommandHandler(repo);
        return new LoggingUseCaseDecorator(useCase, logger, "CreateGroupCommandHandler");
      },
      inject: [LOGGER_PORT, "GroupRepository"],
    },

    {
      provide: GetUserGroupsQueryHandler,
      useFactory: (logger: ILoggerPort, repo: GroupRepository) => {
        const useCase = new GetUserGroupsQueryHandler(repo);
        const withError = new ErrorHandlingDecoratorWithEither(useCase, logger, "GetUserGroupsQueryHandler");
        return new LoggingUseCaseDecorator(withError, logger, "GetUserGroupsQueryHandler");
      },
      inject: [LOGGER_PORT, "GroupRepository"],
    },

    {
      provide: GetGroupDetailsQueryHandler,
      useFactory: (logger: ILoggerPort, repo: GroupRepository) => {
        const useCase = new GetGroupDetailsQueryHandler(repo);
        const withError = new ErrorHandlingDecoratorWithEither(useCase, logger, "GetGroupDetailsQueryHandler");
        return new LoggingUseCaseDecorator(withError, logger, "GetGroupDetailsQueryHandler");
      },
      inject: [LOGGER_PORT, "GroupRepository"],
    },

    {
      provide: GetGroupMembersQueryHandler,
      useFactory: (logger: ILoggerPort, repo: GroupRepository) => {
        const useCase = new GetGroupMembersQueryHandler(repo);
        const withError = new ErrorHandlingDecoratorWithEither(useCase, logger, "GetGroupMembersQueryHandler");
        return new LoggingUseCaseDecorator(withError, logger, "GetGroupMembersQueryHandler");
      },
      inject: [LOGGER_PORT, "GroupRepository"],
    },

    {
      provide: GenerateGroupInvitationCommandHandler,
      useFactory: (
        logger: ILoggerPort,
        repo: GroupRepository,
        generator: InvitationTokenGenerator
      ) => {
        const useCase = new GenerateGroupInvitationCommandHandler(repo, generator);
        const withError = new ErrorHandlingDecoratorWithEither(useCase, logger, "GenerateGroupInvitationCommandHandler");
        return new LoggingUseCaseDecorator(withError, logger, "GenerateGroupInvitationCommandHandler");
      },
      inject: [LOGGER_PORT, "GroupRepository", "InvitationTokenGenerator"],
    },

    {
      provide: JoinGroupByInvitationCommandHandler,
      useFactory: (logger: ILoggerPort, repo: GroupRepository) => {
        const useCase = new JoinGroupByInvitationCommandHandler(repo);
        const withError = new ErrorHandlingDecoratorWithEither(useCase, logger, "JoinGroupByInvitationCommandHandler");
        return new LoggingUseCaseDecorator(withError, logger, "JoinGroupByInvitationCommandHandler");
      },
      inject: [LOGGER_PORT, "GroupRepository"],
    },

    {
      provide: LeaveGroupCommandHandler,
      useFactory: (logger: ILoggerPort, repo: GroupRepository) => {
        const useCase = new LeaveGroupCommandHandler(repo);
        const withError = new ErrorHandlingDecoratorWithEither(useCase, logger, "LeaveGroupCommandHandler");
        return new LoggingUseCaseDecorator(withError, logger, "LeaveGroupCommandHandler");
      },
      inject: [LOGGER_PORT, "GroupRepository"],
    },

    {
      provide: RemoveGroupMemberCommandHandler,
      useFactory: (logger: ILoggerPort, repo: GroupRepository) => {
        const useCase = new RemoveGroupMemberCommandHandler(repo);
        const withError = new ErrorHandlingDecoratorWithEither(useCase, logger, "RemoveGroupMemberCommandHandler");
        return new LoggingUseCaseDecorator(withError, logger, "RemoveGroupMemberCommandHandler");
      },
      inject: [LOGGER_PORT, "GroupRepository"],
    },

    {
      provide: UpdateGroupDetailsCommandHandler,
      useFactory: (logger: ILoggerPort, repo: GroupRepository) => {
        const useCase = new UpdateGroupDetailsCommandHandler(repo);
        const withError = new ErrorHandlingDecoratorWithEither(useCase, logger, "UpdateGroupDetailsCommandHandler");
        return new LoggingUseCaseDecorator(withError, logger, "UpdateGroupDetailsCommandHandler");
      },
      inject: [LOGGER_PORT, "GroupRepository"],
    },

    {
      provide: TransferGroupAdminCommandHandler,
      useFactory: (logger: ILoggerPort, repo: GroupRepository) => {
        const useCase = new TransferGroupAdminCommandHandler(repo);
        const withError = new ErrorHandlingDecoratorWithEither(useCase, logger, "TransferGroupAdminCommandHandler");
        return new LoggingUseCaseDecorator(withError, logger, "TransferGroupAdminCommandHandler");
      },
      inject: [LOGGER_PORT, "GroupRepository"],
    },

    {
      provide: AssignQuizToGroupCommandHandler,
      useFactory: (
        logger: ILoggerPort,
        groupRepo: GroupRepository,
        quizReadService: QuizReadService,
        eventEmitter: EventEmitter2
      ) => {
        const useCase = new AssignQuizToGroupCommandHandler(groupRepo, quizReadService, eventEmitter);
        const withError = new ErrorHandlingDecoratorWithEither(useCase, logger, "AssignQuizToGroupCommandHandler");
        return new LoggingUseCaseDecorator(withError, logger, "AssignQuizToGroupCommandHandler");
      },
      inject: [LOGGER_PORT, "GroupRepository", "QuizReadService", EventEmitter2],
    },

    {
      provide: GetGroupQuizzesQueryHandler,
      useFactory: (logger: ILoggerPort, repo: GroupRepository,
      quizRepo: QuizRepository, gameRepo: SinglePlayerGameRepository,
  ) => {
        const useCase = new GetGroupQuizzesQueryHandler(repo, quizRepo, gameRepo);
        const withError = new ErrorHandlingDecoratorWithEither(useCase, logger, "GetGroupQuizzesQueryHandler");
        return new LoggingUseCaseDecorator(withError, logger, "GetGroupQuizzesQueryHandler");
      },
      inject: [LOGGER_PORT, "GroupRepository", "QuizRepository", "SinglePlayerGameRepository"],
    },

    {
      provide: GetGroupLeaderboardQueryHandler,
      useFactory: (logger: ILoggerPort, repo: GroupRepository, gameRepo: SinglePlayerGameRepository, UserRepo: UserRepository) => {
        const useCase = new GetGroupLeaderboardQueryHandler(repo, gameRepo, UserRepo);
        const withError = new ErrorHandlingDecoratorWithEither(useCase, logger, "GetGroupLeaderboardQueryHandler");
        return new LoggingUseCaseDecorator(withError, logger, "GetGroupLeaderboardQueryHandler");
      },
      inject: [LOGGER_PORT, "GroupRepository", "SinglePlayerGameRepository", "UserRepository"],
    },

    {
      provide: GetGroupQuizLeaderboardQueryHandler,
      useFactory: (logger: ILoggerPort, repo: GroupRepository, gameRepo: SinglePlayerGameRepository, UserRepo: UserRepository,) => {
        const useCase = new GetGroupQuizLeaderboardQueryHandler(repo, gameRepo, UserRepo);
        return new LoggingUseCaseDecorator(useCase, logger, "GetGroupQuizLeaderboardQueryHandler");
      },
      inject: [LOGGER_PORT, "GroupRepository", "SinglePlayerGameRepository", "UserRepository"],
    },
  ],
  exports: ["GroupRepository", TypeOrmModule],
})
export class GroupsModule {}
