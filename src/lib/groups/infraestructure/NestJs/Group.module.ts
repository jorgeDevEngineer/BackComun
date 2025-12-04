import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { GroupsController } from "./Group.controller";

import { GroupOrmEntity } from "../TypeOrm/GroupOrmEntity";
import { GroupMemberOrmEntity } from "../TypeOrm/GroupOrnMember";
import { TypeOrmGroupRepository } from "../TypeOrm/TypeOrmGroupRepository";
import { AssignQuizToGroupUseCase } from "../../application/AssignQuizToGroupUseCase";
import { GroupRepository } from "../../domain/port/GroupRepository";
import { GroupQuizAssignmentOrmEntity } from "../TypeOrm/GroupQuizAssigmentOrmEntity";


import { CreateGroupUseCase } from "../../application/CrearteGroupUseCase";
import { GetUserGroupsUseCase } from "../../application/GetUserGroupsUseCase";
import { GetGroupDetailUseCase } from "../../application/GroupDetailsUseCase";
import { GenerateGroupInvitationUseCase } from "../../application/GenerateGroupInvitationUseCase";
import { cryptoInvitationTokenGenerator } from "../Token/InvitationTokenGenerator";
import { InvitationTokenGenerator } from "../../domain/port/GroupInvitationTokenGenerator";
import { JoinGroupByInvitationUseCase } from "../../application/JoinGroupByInvitation";
import { LeaveGroupUseCase } from "../../application/LeaveGroupUseCase";
import { RemoveGroupMemberUseCase } from "../../application/RemoveGroupMemberUseCase";
import { UpdateGroupInfoUseCase } from "../../application/UpdateGroupDetailsUseCase";
import { TransferGroupAdminUseCase } from "../../application/TransferGroupAdminUseCase";
import { GetGroupMembersUseCase } from "../../application/GetGroupMembers";

@Module({
  imports: [TypeOrmModule.forFeature([GroupOrmEntity, GroupMemberOrmEntity,GroupQuizAssignmentOrmEntity])],
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
    },
    {
      provide: GetGroupMembersUseCase,
      useFactory: (repo: GroupRepository) => new GetGroupMembersUseCase(repo),
      inject: ["GroupRepository"],
    },
    {
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
    },{
      provide: LeaveGroupUseCase,
      useFactory: (repo: GroupRepository) => new LeaveGroupUseCase(repo),
      inject: ["GroupRepository"],
    },
    {
      provide: RemoveGroupMemberUseCase,
      useFactory: (repo: GroupRepository) =>
        new RemoveGroupMemberUseCase(repo),
      inject: ["GroupRepository"],
    },
    {
      provide: UpdateGroupInfoUseCase,
      useFactory: (repo: GroupRepository) =>
        new UpdateGroupInfoUseCase(repo),
      inject: ["GroupRepository"],
    },
    {
      provide: TransferGroupAdminUseCase,
      useFactory: (repo: GroupRepository) =>
        new TransferGroupAdminUseCase(repo),
      inject: ["GroupRepository"],
},
{
      provide: AssignQuizToGroupUseCase,
      useFactory: (groupRepo: GroupRepository) =>
        new AssignQuizToGroupUseCase(groupRepo),
      inject: ["GroupRepository"],
    },
  
  ],
})
export class GroupsModule {}
 