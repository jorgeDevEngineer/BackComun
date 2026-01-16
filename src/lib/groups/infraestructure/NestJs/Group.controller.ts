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
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Inject,
  Headers,
} from "@nestjs/common";
import { CreateGroupCommand } from "../../application/parameterObjects/CreateGroupCommand";
import { CreateGroupCommandHandler } from "../../application/Handlers/commands/CreateGroupCommandHandler";
import { UpdateGroupDetailsCommandHandler } from "../../application/Handlers/commands/UpdateGroupDetailsCommandHandler";
import { UpdateGroupDetailsCommand } from "../../application/parameterObjects/UpdateGroupDetailsCommand";
import { JoinGroupByInvitationCommand } from "../../application/parameterObjects/JoinGroupByInvitationCommand";
import { JoinGroupByInvitationCommandHandler } from "../../application/Handlers/commands/JoinGroupByInvitationCommandHandler";
import { GenerateGroupInvitationCommand } from "../../application/parameterObjects/GenerateGroupInvitationCommand";
import { GenerateGroupInvitationCommandHandler } from "../../application/Handlers/commands/GenerateGroupInvitationCommandHandler";
import { LeaveGroupCommand } from "../../application/parameterObjects/LeaveGroupCommand";
import { LeaveGroupCommandHandler } from "../../application/Handlers/commands/LeaveGroupCommandHandler";
import { RemoveGroupMemberCommand } from "../../application/parameterObjects/RemoveGroupMemberCommand";
import { RemoveGroupMemberCommandHandler } from "../../application/Handlers/commands/RemoveGroupMemberCommandHandler";
import { TransferGroupAdminCommand } from "../../application/parameterObjects/TransferGroupAdminCommand";
import { TransferGroupAdminCommandHandler } from "../../application/Handlers/commands/TransferGroupAdminCommandHandler";
import { AssignQuizToGroupCommand } from "../../application/parameterObjects/AssignQuizToGroupCommand";
import { AssignQuizToGroupCommandHandler } from "../../application/Handlers/commands/AssignQuizToGroupCommandHandler";
import { GetUserGroupsQuery } from "../../application/parameterObjects/GetUserGroupsQuery";
import { GetUserGroupsQueryHandler } from "../../application/Handlers/queries/GetUserGroupsQueryHandler";
import { GetGroupMembersQuery } from "../../application/parameterObjects/GetGroupMembersQuery";
import { GetGroupMembersQueryHandler } from "../../application/Handlers/queries/GetGroupMembersQueryHandler";
import { GetGroupDetailsQuery } from "../../application/parameterObjects/GetGroupDetailsQuery";
import { GetGroupDetailsQueryHandler } from "../../application/Handlers/queries/GetGroupDetailsQueryHandler";
import { GetGroupQuizzesQuery } from "../../application/parameterObjects/GetGroupQuizzesQuery";
import { GetGroupQuizzesQueryHandler } from "../../application/Handlers/queries/GetGroupQuizzesQueryHandler";
import { GetGroupLeaderboardQuery } from "../../application/parameterObjects/GetGroupLeaderboardQuery";
import { GetGroupLeaderboardQueryHandler } from "../../application/Handlers/queries/GetGroupLeaderboardQUeryHandler";
import { GetGroupQuizLeaderboardQuery } from "../../application/parameterObjects/GetGroupQuizLeaderboarQuery";
import { GetGroupQuizLeaderboardQueryHandler } from "../../application/Handlers/queries/GetGroupQuizLeaderboardQueryHandler";

import { CreateGroupRequestDto, AssignQuizToGroupRequestDto } from "../../application/dtos/GroupRequest.dto";
import { CreateGroupResponseDto, AssignQuizToGroupResponseDto } from "../../application/dtos/GroupResponse.dto";

import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { GroupNotFoundError } from "src/lib/shared/exceptions/GroupNotFoundError";
import { UserNotMemberOfGroupError } from "../../../shared/exceptions/NotMemberGroupError";
import { GroupBusinessException } from "src/lib/shared/exceptions/GroupGenException";
import { ITokenProvider } from "src/lib/auth/application/providers/ITokenProvider";

@Controller("groups")
export class GroupsController {
  constructor(
    private readonly createGroupHandler: CreateGroupCommandHandler,
    private readonly updateGroupDetailsHandler: UpdateGroupDetailsCommandHandler,
    private readonly joinGroupByInvitationHandler: JoinGroupByInvitationCommandHandler,
    private readonly generateGroupInvitationHandler: GenerateGroupInvitationCommandHandler,
    private readonly leaveGroupCommandHandler: LeaveGroupCommandHandler,
    private readonly removeGroupMemberCommandHandler: RemoveGroupMemberCommandHandler,
    private readonly transferGroupAdminCommandHandler: TransferGroupAdminCommandHandler,
    private readonly assignQuizToGroupCommandHandler: AssignQuizToGroupCommandHandler,
    private readonly getUserGroupsQueryHandler: GetUserGroupsQueryHandler,
    private readonly getGroupMembersQueryHandler: GetGroupMembersQueryHandler,
    private readonly getGroupDetailsQueryHandler: GetGroupDetailsQueryHandler,
    private readonly getGroupAssignedQuizzesQueryHandler: GetGroupQuizzesQueryHandler,
    private readonly getGroupLeaderboardQueryHandler: GetGroupLeaderboardQueryHandler,
    private readonly getGroupQuizLeaderboardQueryHandler: GetGroupQuizLeaderboardQueryHandler,

    @Inject("ITokenProvider") 
    private readonly tokenProvider: ITokenProvider 
  ) {}

  private async getCurrentUserId(authHeader: string): Promise<string> {
    const token = authHeader?.replace(/^Bearer\s+/i, "");
    if (!token) {
      throw new Error("Token required");
    }
    const payload = await this.tokenProvider.validateToken(token);
    if (!payload || !payload.id) {
      throw new Error("Invalid token");
    }
    return payload.id;
  }

  // --- MÉTODO HELPER PARA DESEMPAQUETAR EITHER ---
  private handleResult<T>(result: Either<DomainException, T>): T {
    if (result.isLeft()) {
      const error = result.getLeft();
      
      if (error instanceof GroupNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof UserNotMemberOfGroupError) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof GroupBusinessException) {
        throw new BadRequestException(error.message);
      }      
      throw new InternalServerErrorException(error.message);
    }    
    return result.getRight();
  }

  // --------------------------------------------------------
  // ENDPOINTS
  // --------------------------------------------------------

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createGroup(
    @Body() body: CreateGroupRequestDto,
    @Headers('authorization') authHeader: string 
  ): Promise<CreateGroupResponseDto> {
    const currentUserId = await this.getCurrentUserId(authHeader);
    const command = new CreateGroupCommand(body.name, currentUserId);
        return this.createGroupHandler.execute(command);
  }

  @Post(":groupId/quizzes")
  @HttpCode(HttpStatus.CREATED)
  async assignQuizToGroup(
    @Param("groupId") groupId: string,
    @Body() body: AssignQuizToGroupRequestDto,
    @Headers('authorization') authHeader: string 
  ): Promise<AssignQuizToGroupResponseDto> {
    const currentUserId = await this.getCurrentUserId(authHeader);

    if (!body.availableUntil) {
      throw new BadRequestException("es necesario proporcionar availableUntil");
    }
    const availableUntil = new Date(body.availableUntil);
    
    const command = new AssignQuizToGroupCommand(
      groupId,
      body.quizId,
      currentUserId,
      availableUntil,
    );
    
    const result = await this.assignQuizToGroupCommandHandler.execute(command);
    return this.handleResult(result);
  }

  @Get(':groupId/quizzes')
  async getAssignedQuizzes(
    @Param('groupId') groupId: string,
    @Headers('authorization') authHeader: string 
  ) {
    const currentUserId = await this.getCurrentUserId(authHeader);
    const query = new GetGroupQuizzesQuery(groupId, currentUserId);
    const result = await this.getGroupAssignedQuizzesQueryHandler.execute(query);
    return this.handleResult(result);
  }

  @Get()
  async getMyGroups(
    @Headers('authorization') authHeader: string 
  ) {
    const currentUserId = await this.getCurrentUserId(authHeader);
    const query = new GetUserGroupsQuery(currentUserId);
    const result = await this.getUserGroupsQueryHandler.execute(query);
    return this.handleResult(result);
  }

  @Get(":id")
  async getGroupDetail(
    @Param("id") id: string, 
    @Headers('authorization') authHeader: string 
  ) {
    const currentUserId = await this.getCurrentUserId(authHeader);
    const query = new GetGroupDetailsQuery(id, currentUserId);
    const result = await this.getGroupDetailsQueryHandler.execute(query);
    return this.handleResult(result);
  }

  @Get(":id/members")
  async getGroupmembers(
    @Param("id") id: string, 
    @Headers('authorization') authHeader: string 
  ) {
    const currentUserId = await this.getCurrentUserId(authHeader);
    const query = new GetGroupMembersQuery(id, currentUserId);
    const result = await this.getGroupMembersQueryHandler.execute(query);
    return this.handleResult(result);
  }

  @Post(":id/invitations")
  async generateInvitation(@Param("id") id: string,@Headers('authorization') authHeader: string 
) {
    const currentUserId = await this.getCurrentUserId(authHeader);
    const command = new GenerateGroupInvitationCommand(
      id,
      currentUserId,
    );
    const result = await this.generateGroupInvitationHandler.execute(command);
    return this.handleResult(result);
  }

  @Post("join")
  async joinByInvitation(
    @Body() body: { token: string },
    @Headers('authorization') authHeader: string 
  ) {
    const currentUserId = await this.getCurrentUserId(authHeader);
    const command = new JoinGroupByInvitationCommand(
      body.token,
      currentUserId,
    );
    const result = await this.joinGroupByInvitationHandler.execute(command);
    return this.handleResult(result);
  }

  @Post(":id/leave")
  async leaveGroup(
    @Param("id") id: string, 
    @Headers('authorization') authHeader: string 
  ) {
    const currentUserId = await this.getCurrentUserId(authHeader);
    const command = new LeaveGroupCommand(
      id,
      currentUserId,
    );
    const result = await this.leaveGroupCommandHandler.execute(command);
    return this.handleResult(result);
  }

  @Delete(":id/members/:memberId")
  async removeMember(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @Headers('authorization') authHeader: string 
  ) {
    const currentUserId = await this.getCurrentUserId(authHeader);
    const command = new RemoveGroupMemberCommand(
      id,
      memberId,
      currentUserId,
    );
    const result = await this.removeGroupMemberCommandHandler.execute(command);
    return this.handleResult(result);
  }

  @Patch(":id")
  async updateGroupInfo(
    @Param("id") id: string,
    @Body() body: { name?: string; description?: string },
    @Headers('authorization') authHeader: string 
  ) {
    const currentUserId = await this.getCurrentUserId(authHeader);
    const command = new UpdateGroupDetailsCommand(
      id,
      currentUserId,
      body.name,
      body.description,
    );
    const result = await this.updateGroupDetailsHandler.execute(command);
    return this.handleResult(result);
  }

  @Post(":id/transfer-admin")
  async transferAdmin(
    @Param("id") id: string,
    @Body() body: { newAdminUserId: string },
    @Headers('authorization') authHeader: string 
  ) {
    const currentUserId = await this.getCurrentUserId(authHeader);
    const command = new TransferGroupAdminCommand(
      id,
      currentUserId,
      body.newAdminUserId,
    );
    const result = await this.transferGroupAdminCommandHandler.execute(command);
    return this.handleResult(result);
  }

  @Get(':groupId/leaderboard')
  async getGroupLeaderboard(
    @Param('groupId') groupId: string,
    @Headers('authorization') authHeader: string 
  ) {
    const userId = await this.getCurrentUserId(authHeader);
    const query = new GetGroupLeaderboardQuery(groupId, userId);
    const result = await this.getGroupLeaderboardQueryHandler.execute(query);
    return this.handleResult(result);
  }

  @Get(":groupId/quizzes/:quizId/leaderboard")
  async getGroupQuizLeaderboard(
    @Param("groupId") groupId: string,
    @Param("quizId") quizId: string,
    @Headers('authorization') authHeader: string 
  ) {
    const userId = await this.getCurrentUserId(authHeader);
    const query = new GetGroupQuizLeaderboardQuery(
      groupId,
      quizId,
      userId,
    );
    return await this.getGroupQuizLeaderboardQueryHandler.execute(query);
  }
}



