import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { GroupsController } from "./Group.controller";

import { GroupOrmEntity } from "../TypeOrm/GroupOrmEntity";
import { GroupMemberOrmEntity } from "../TypeOrm/GroupOrnMember";
import { TypeOrmGroupRepository } from "../TypeOrm/TypeOrmGroupRepository";
import { GroupRepository } from "../../domain/port/GroupRepository";

import { CreateGroupUseCase } from "../../application/CrearteGroupUseCase";
import { GetUserGroupsUseCase } from "../../application/GetUserGroupsUseCase";
import { GetGroupDetailUseCase } from "../../application/GroupDetailsUseCase";
import { GenerateGroupInvitationUseCase } from "../../application/GenerateGroupInvitationUseCase";
import { cryptoInvitationTokenGenerator } from "../token/InvitationTokenGeenerator";
import { InvitationTokenGenerator } from "../../domain/port/GroupInvitationTokenGenerator";
import { JoinGroupByInvitationUseCase } from "../../application/JoinGroupByInvitation";

@Module({
  imports: [TypeOrmModule.forFeature([GroupOrmEntity, GroupMemberOrmEntity])],
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
      provide: CreateGroupUseCase,
      useFactory: (repo: GroupRepository) => new CreateGroupUseCase(repo),
      inject: ["GroupRepository"],
    },
    {
      provide: GetUserGroupsUseCase,
      useFactory: (repo: GroupRepository) => new GetUserGroupsUseCase(repo),
      inject: ["GroupRepository"],
    },
    {
      provide: GetGroupDetailUseCase,
      useFactory: (repo: GroupRepository) => new GetGroupDetailUseCase(repo),
      inject: ["GroupRepository"],
    },{
      provide: GenerateGroupInvitationUseCase,
      useFactory: (
        repo: GroupRepository,
        generator: InvitationTokenGenerator,
      ) => new GenerateGroupInvitationUseCase(repo, generator),
      inject: ["GroupRepository", "InvitationTokenGenerator"],
    },{
      provide: JoinGroupByInvitationUseCase,
      useFactory: (repo: GroupRepository) =>
        new JoinGroupByInvitationUseCase(repo),
      inject: ["GroupRepository"],
    },
  ],
})
export class GroupsModule {}