import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { GroupsController } from "./Group.controller";

// 1. Entidades
import { GroupOrmEntity } from "../TypeOrm/GroupOrmEntity";
import { GroupMemberOrmEntity } from "../TypeOrm/GroupOrnMember";
import { GroupQuizAssignmentOrmEntity } from "../TypeOrm/GroupQuizAssigmentOrmEntity";
import { TypeOrmQuizEntity } from "../../../kahoot/infrastructure/TypeOrm/TypeOrmQuizEntity";
import { TypeOrmSinglePlayerGameEntity } from "src/lib/singlePlayerGame/infrastructure/TypeOrm/TypeOrmSinglePlayerGameEntity";

// 2. Repositorios y Servicios
import { TypeOrmGroupRepository } from "../TypeOrm/TypeOrmGroupRepository";
import { TypeOrmQuizReadService } from "../TypeOrm/QuizReadServiceImplementation";
import { cryptoInvitationTokenGenerator } from "../Token/InvitationTokenGenerator";

// 3. Puertos
import { GroupRepository } from "../../domain/port/GroupRepository";
import { InvitationTokenGenerator } from "../../domain/port/GroupInvitationTokenGenerator";
import { QuizReadService } from "../../domain/port/QuizReadService";

// 4. Handlers
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

// 5. Shared (Logger y Decorators)
import { LoggerModule } from "src/lib/shared/aspects/logger/infrastructure/logger.module";
import { LoggingUseCaseDecorator } from "src/lib/shared/aspects/logger/application/decorators/logging.decorator";
import { ILoggerPort, LOGGER_PORT } from "src/lib/shared/aspects/logger/domain/ports/logger.port";
import { ErrorHandlingDecoratorWithEither } from "src/lib/shared/aspects/error-handling/application/decorators/error-handling-either";

@Module({
  imports: [
    LoggerModule, // Módulo de Logs compartido
    TypeOrmModule.forFeature([
      GroupOrmEntity,
      GroupMemberOrmEntity,
      GroupQuizAssignmentOrmEntity,
      TypeOrmQuizEntity,
      TypeOrmSinglePlayerGameEntity,
    ]),
  ],
  controllers: [GroupsController],
  providers: [
    // --- INFRAESTRUCTURA ---
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

    // --- HANDLERS CON DECORADORES (FACTORY PATTERN) ---

    // 1. CreateGroupCommandHandler (SOLO LOGGER, SIN ERROR HANDLING)
    {
      provide: CreateGroupCommandHandler,
      useFactory: (logger: ILoggerPort, repo: GroupRepository) => {
        const useCase = new CreateGroupCommandHandler(repo);
        return new LoggingUseCaseDecorator(useCase, logger, "CreateGroupCommandHandler");
      },
      inject: [LOGGER_PORT, "GroupRepository"],
    },

    // 2. GetUserGroupsQueryHandler
    {
      provide: GetUserGroupsQueryHandler,
      useFactory: (logger: ILoggerPort, repo: GroupRepository) => {
        const useCase = new GetUserGroupsQueryHandler(repo);
        const withError = new ErrorHandlingDecoratorWithEither(useCase, logger, "GetUserGroupsQueryHandler");
        return new LoggingUseCaseDecorator(withError, logger, "GetUserGroupsQueryHandler");
      },
      inject: [LOGGER_PORT, "GroupRepository"],
    },

    // 3. GetGroupDetailsQueryHandler
    {
      provide: GetGroupDetailsQueryHandler,
      useFactory: (logger: ILoggerPort, repo: GroupRepository) => {
        const useCase = new GetGroupDetailsQueryHandler(repo);
        const withError = new ErrorHandlingDecoratorWithEither(useCase, logger, "GetGroupDetailsQueryHandler");
        return new LoggingUseCaseDecorator(withError, logger, "GetGroupDetailsQueryHandler");
      },
      inject: [LOGGER_PORT, "GroupRepository"],
    },

    // 4. GetGroupMembersQueryHandler
    {
      provide: GetGroupMembersQueryHandler,
      useFactory: (logger: ILoggerPort, repo: GroupRepository) => {
        const useCase = new GetGroupMembersQueryHandler(repo);
        const withError = new ErrorHandlingDecoratorWithEither(useCase, logger, "GetGroupMembersQueryHandler");
        return new LoggingUseCaseDecorator(withError, logger, "GetGroupMembersQueryHandler");
      },
      inject: [LOGGER_PORT, "GroupRepository"],
    },

    // 5. GenerateGroupInvitationCommandHandler (2 dependencias)
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

    // 6. JoinGroupByInvitationCommandHandler
    {
      provide: JoinGroupByInvitationCommandHandler,
      useFactory: (logger: ILoggerPort, repo: GroupRepository) => {
        const useCase = new JoinGroupByInvitationCommandHandler(repo);
        const withError = new ErrorHandlingDecoratorWithEither(useCase, logger, "JoinGroupByInvitationCommandHandler");
        return new LoggingUseCaseDecorator(withError, logger, "JoinGroupByInvitationCommandHandler");
      },
      inject: [LOGGER_PORT, "GroupRepository"],
    },

    // 7. LeaveGroupCommandHandler
    {
      provide: LeaveGroupCommandHandler,
      useFactory: (logger: ILoggerPort, repo: GroupRepository) => {
        const useCase = new LeaveGroupCommandHandler(repo);
        const withError = new ErrorHandlingDecoratorWithEither(useCase, logger, "LeaveGroupCommandHandler");
        return new LoggingUseCaseDecorator(withError, logger, "LeaveGroupCommandHandler");
      },
      inject: [LOGGER_PORT, "GroupRepository"],
    },

    // 8. RemoveGroupMemberCommandHandler
    {
      provide: RemoveGroupMemberCommandHandler,
      useFactory: (logger: ILoggerPort, repo: GroupRepository) => {
        const useCase = new RemoveGroupMemberCommandHandler(repo);
        const withError = new ErrorHandlingDecoratorWithEither(useCase, logger, "RemoveGroupMemberCommandHandler");
        return new LoggingUseCaseDecorator(withError, logger, "RemoveGroupMemberCommandHandler");
      },
      inject: [LOGGER_PORT, "GroupRepository"],
    },

    // 9. UpdateGroupDetailsCommandHandler
    {
      provide: UpdateGroupDetailsCommandHandler,
      useFactory: (logger: ILoggerPort, repo: GroupRepository) => {
        const useCase = new UpdateGroupDetailsCommandHandler(repo);
        const withError = new ErrorHandlingDecoratorWithEither(useCase, logger, "UpdateGroupDetailsCommandHandler");
        return new LoggingUseCaseDecorator(withError, logger, "UpdateGroupDetailsCommandHandler");
      },
      inject: [LOGGER_PORT, "GroupRepository"],
    },

    // 10. TransferGroupAdminCommandHandler
    {
      provide: TransferGroupAdminCommandHandler,
      useFactory: (logger: ILoggerPort, repo: GroupRepository) => {
        const useCase = new TransferGroupAdminCommandHandler(repo);
        const withError = new ErrorHandlingDecoratorWithEither(useCase, logger, "TransferGroupAdminCommandHandler");
        return new LoggingUseCaseDecorator(withError, logger, "TransferGroupAdminCommandHandler");
      },
      inject: [LOGGER_PORT, "GroupRepository"],
    },

    // 11. AssignQuizToGroupCommandHandler (2 dependencias)
    {
      provide: AssignQuizToGroupCommandHandler,
      useFactory: (
        logger: ILoggerPort,
        groupRepo: GroupRepository,
        quizReadService: QuizReadService
      ) => {
        const useCase = new AssignQuizToGroupCommandHandler(groupRepo, quizReadService);
        const withError = new ErrorHandlingDecoratorWithEither(useCase, logger, "AssignQuizToGroupCommandHandler");
        return new LoggingUseCaseDecorator(withError, logger, "AssignQuizToGroupCommandHandler");
      },
      inject: [LOGGER_PORT, "GroupRepository", "QuizReadService"],
    },

    // 12. GetGroupQuizzesQueryHandler
    {
      provide: GetGroupQuizzesQueryHandler,
      useFactory: (logger: ILoggerPort, repo: GroupRepository) => {
        const useCase = new GetGroupQuizzesQueryHandler(repo);
        const withError = new ErrorHandlingDecoratorWithEither(useCase, logger, "GetGroupQuizzesQueryHandler");
        return new LoggingUseCaseDecorator(withError, logger, "GetGroupQuizzesQueryHandler");
      },
      inject: [LOGGER_PORT, "GroupRepository"],
    },

    // 13. GetGroupLeaderboardQueryHandler
    {
      provide: GetGroupLeaderboardQueryHandler,
      useFactory: (logger: ILoggerPort, repo: GroupRepository) => {
        const useCase = new GetGroupLeaderboardQueryHandler(repo);
        const withError = new ErrorHandlingDecoratorWithEither(useCase, logger, "GetGroupLeaderboardQueryHandler");
        return new LoggingUseCaseDecorator(withError, logger, "GetGroupLeaderboardQueryHandler");
      },
      inject: [LOGGER_PORT, "GroupRepository"],
    },

    // 14. GetGroupQuizLeaderboardQueryHandler
    {
      provide: GetGroupQuizLeaderboardQueryHandler,
      useFactory: (logger: ILoggerPort, repo: GroupRepository) => {
        const useCase = new GetGroupQuizLeaderboardQueryHandler(repo);
        return new LoggingUseCaseDecorator(useCase, logger, "GetGroupQuizLeaderboardQueryHandler");
      },
      inject: [LOGGER_PORT, "GroupRepository"],
    },
  ],
  exports: ["GroupRepository", TypeOrmModule],
})
export class GroupsModule {}