import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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

@Controller("groups")
export class GroupsController {
  constructor(
    private readonly createGroupUseCase: CreateGroupUseCase,
    private readonly getUserGroupsUseCase: GetUserGroupsUseCase,
    private readonly getGroupDetailUseCase: GetGroupDetailUseCase,
    private readonly generateGroupInvitationUseCase: GenerateGroupInvitationUseCase,
    private readonly joinGroupByInvitationUseCase: JoinGroupByInvitationUseCase,
  ) {}

  private getCurrentUserId(req: Request): string {
    let currentUserId = (req as any).user?.id || (req as any).user?.sub;

    if (!currentUserId) {
      //  SOLO PARA PRUEBAS
      currentUserId = "123e4567-e89b-42d3-a456-426614174000";
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
}









