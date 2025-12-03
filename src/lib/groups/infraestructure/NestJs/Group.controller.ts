import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
} from "@nestjs/common";
import { Request } from "express";

import { CreateGroupUseCase } from "../../application/CrearteGroupUseCase";
import { GetUserGroupsUseCase } from "../../application/GetUserGroupsUseCase";
import { GetGroupDetailUseCase } from "../../application/GroupDetailsUseCase";
import { GenerateGroupInvitationUseCase } from "../../application/GenerateGroupInvitationUseCase";

import { CreateGroupRequestDto } from "../../application/CrearteGroupUseCase";
import { CreateGroupResponseDto } from "../../application/CrearteGroupUseCase";
import { JoinGroupByInvitationUseCase } from "../../application/JoinGroupByInvitation";
import { RemoveGroupMemberUseCase } from "../../application/RemoveGroupMemberUseCase";
import { UpdateGroupInfoUseCase } from "../../application/UpdateGroupDetailsUseCase";
import { LeaveGroupUseCase } from "../../application/LeaveGroupUseCase";
import { TransferGroupAdminUseCase } from "../../application/TransferGroupAdminUseCase";

@Controller("groups")
export class GroupsController {
  constructor(
    private readonly createGroupUseCase: CreateGroupUseCase,
    private readonly getUserGroupsUseCase: GetUserGroupsUseCase,
    private readonly getGroupDetailUseCase: GetGroupDetailUseCase,
    private readonly generateGroupInvitationUseCase: GenerateGroupInvitationUseCase,
    private readonly joinGroupByInvitationUseCase: JoinGroupByInvitationUseCase,
    private readonly leaveGroupUseCase: LeaveGroupUseCase,
    private readonly removeGroupMemberUseCase: RemoveGroupMemberUseCase,
    private readonly updateGroupInfoUseCase: UpdateGroupInfoUseCase,
    private readonly transferGroupAdminUseCase: TransferGroupAdminUseCase,
  ) {}

  private getCurrentUserId(req: Request): string {
    let currentUserId = (req as any).user?.id || (req as any).user?.sub;

    if (!currentUserId) {
      //  SOLO PARA PRUEBAS
      currentUserId = "123e4567-e89b-42d3-a456-426614174123";
      console.log(" Usando userId de prueba:", currentUserId);
    }

    return currentUserId;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createGroup(
    @Body() body: CreateGroupRequestDto,
    @Req() req: Request,
  ): Promise<CreateGroupResponseDto> {
    const currentUserId = this.getCurrentUserId(req);

    const result = await this.createGroupUseCase.execute({
      name: body.name,
      currentUserId,
    });

    return result;
  }

  @Get()
  async getMyGroups(@Req() req: Request) {
    const currentUserId = this.getCurrentUserId(req);

    return this.getUserGroupsUseCase.execute({ currentUserId });
  }

  @Get(":id")
  async getGroupDetail(@Param("id") id: string, @Req() req: Request) {
    const currentUserId = this.getCurrentUserId(req);

    return this.getGroupDetailUseCase.execute({
      groupId: id,
      currentUserId,
    });
  }

  @Post(":id/invitation")
  async generateInvitation(@Param("id") id: string, @Req() req: Request) {
    const currentUserId = this.getCurrentUserId(req);

    return this.generateGroupInvitationUseCase.execute({
      groupId: id,
      currentUserId,
    });
  }

  @Post("join")
  async joinByInvitation(
    @Body() body: { token: string },
    @Req() req: Request,
  ) {
    const currentUserId = this.getCurrentUserId(req);

    return this.joinGroupByInvitationUseCase.execute({
      token: body.token,
      currentUserId,
    });
  }
  @Post(":id/leave")
  async leaveGroup(@Param("id") id: string, @Req() req: Request) {
    const currentUserId = this.getCurrentUserId(req);

    return this.leaveGroupUseCase.execute({
      groupId: id,
      currentUserId,
    });
  }
  @Delete(":id/members/:memberId")
  async removeMember(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @Req() req: Request,
  ) {
    const currentUserId = this.getCurrentUserId(req);

    return this.removeGroupMemberUseCase.execute({
      groupId: id,
      targetUserId: memberId,
      currentUserId,
    });
  }
  @Patch(":id")
  async updateGroupInfo(
    @Param("id") id: string,
    @Body() body: { name?: string; description?: string },
    @Req() req: Request,
  ) {
    const currentUserId = this.getCurrentUserId(req);

    return this.updateGroupInfoUseCase.execute({
      groupId: id,
      currentUserId,
      name: body.name,
      description: body.description,
    });
  }
  @Post(":id/transfer-admin")
  async transferAdmin(
    @Param("id") id: string,
    @Body() body: { newAdminUserId: string },
    @Req() req: Request,
) {
  const currentUserId = this.getCurrentUserId(req);

  return this.transferGroupAdminUseCase.execute({
    groupId: id,
    currentUserId,
    newAdminUserId: body.newAdminUserId,
  });
}

}









