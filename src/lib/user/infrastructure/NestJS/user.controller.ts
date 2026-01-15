import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Param,
  Patch,
  Post,
  Put,
  Headers,
} from "@nestjs/common";
import { GetAllUsersQueryHandler } from "../../application/Handlers/Querys/GetAllUsersQueryHandler";
import { GetOneUserByIdQueryHandler } from "../../application/Handlers/Querys/GetOneUserByIdQueryHandler";
import { GetOneUserByUserNameQueryHandler } from "../../application/Handlers/Querys/GetOneUserByUserNameQueryHandler";
import { CreateUserCommandHandler } from "../../application/Handlers/Commands/CreateUserCommandHandler";
import { CreateUser } from "../../application/Parameter Objects/CreateUser";
import { EditUserCommandHandler } from "../../application/Handlers/Commands/EditUserCommandHandler";
import { DeleteUserCommandHandler } from "../../application/Handlers/Commands/DeleteUserCommandHandler";
import { FindByIdParams } from "../DTOs/FindByIdParams";
import { FindByUserNameParams } from "../DTOs/FindByUserNameParams";
import { UserNotFoundException } from "../../application/exceptions/UserNotFoundException";
import { Create } from "../DTOs/Create";
import { Edit } from "../DTOs/Edit";
import { EnableFreeMembershipCommandHandler } from "../../application/Handlers/Commands/EnableFreeMembershipCommandHandler";
import { EnablePremiumMembershipCommandHandler } from "../../application/Handlers/Commands/EnablePremiumMembershipCommandHandler";
import { MEMBERSHIP_TYPES } from "../../domain/valueObject/MembershipType";
import { GetAllUsers } from "../../application/Parameter Objects/GetAllUsers";
import { GetOneUserById } from "../../application/Parameter Objects/GetOneUserById";
import { GetOneUserByUserName } from "../../application/Parameter Objects/GetOneUserByUserName";
import { EditUser } from "../../application/Parameter Objects/EditUser";
import { DeleteUser } from "../../application/Parameter Objects/DeleteUser";
import { EnableFreeMembership } from "../../application/Parameter Objects/EnableFreeMembership";
import { EnablePremiumMembership } from "../../application/Parameter Objects/EnablePremiumMembership";
import { Result } from "src/lib/shared/Type Helpers/result";
import { User } from "../../domain/aggregate/User";
import { get } from "http";
import { ITokenProvider } from "src/lib/auth/application/providers/ITokenProvider";
import { IAssetUrlResolver } from "src/lib/shared/application/providers/IAssetUrlResolver";
import { DomainException } from "src/lib/shared/exceptions/domain.exception";

@Controller("user")
export class UserController {
  constructor(
    @Inject(GetAllUsersQueryHandler)
    private readonly getAllUsers: GetAllUsersQueryHandler,
    @Inject(GetOneUserByIdQueryHandler)
    private readonly getOneUserById: GetOneUserByIdQueryHandler,
    @Inject(GetOneUserByUserNameQueryHandler)
    private readonly getOneUserByUserName: GetOneUserByUserNameQueryHandler,
    @Inject(CreateUserCommandHandler)
    private readonly createUserCommandHandler: CreateUserCommandHandler,
    @Inject(EditUserCommandHandler)
    private readonly editUser: EditUserCommandHandler,
    @Inject(DeleteUserCommandHandler)
    private readonly deleteUser: DeleteUserCommandHandler,
    @Inject(EnablePremiumMembershipCommandHandler)
    private readonly enablePremiumMembership: EnablePremiumMembershipCommandHandler,
    @Inject(EnableFreeMembershipCommandHandler)
    private readonly enableFreeMembership: EnableFreeMembershipCommandHandler,
    @Inject("ITokenProvider") private readonly tokenProvider: ITokenProvider,
    @Inject("IAssetUrlResolver")
    private readonly assetUrlResolver: IAssetUrlResolver
  ) {}

  private async getCurrentUserId(authHeader: string): Promise<string> {
    const token = authHeader?.replace(/^Bearer\s+/i, "");
    if (!token) {
      throw new UnauthorizedException("Token required");
    }
    const payload = await this.tokenProvider.validateToken(token);
    if (!payload || !payload.id) {
      throw new UnauthorizedException("Invalid token");
    }
    return payload.id;
  }

  handleResult<T>(result: Result<T>): T {
    if (result.isFailure) {
      if (result.error instanceof UserNotFoundException) {
        throw new NotFoundException(result.error.message);
      }
      if (result.error instanceof DomainException) {
        throw new BadRequestException(result.error.message);
      }
      throw new InternalServerErrorException(result.error.message);
    }
    return result.getValue()!;
  }

  handleBadRequestResult<T>(result: Result<T>): T {
    if (result.isFailure) {
      throw new BadRequestException(result.error.message);
    }
    return result.getValue()!;
  }

  private addAvatarUrlToUser(userObj: any) {
    if (!userObj) return userObj;

    let updated = { ...userObj };

    // Map top-level avatarAssetId -> avatarAssetUrl
    if (Object.prototype.hasOwnProperty.call(updated, "avatarAssetId")) {
      const id = updated.avatarAssetId;
      const url = this.assetUrlResolver.resolveAvatarUrl(id);
      const { avatarAssetId, ...rest } = updated;
      updated = { ...rest, avatarAssetUrl: url };
    }

    // Map nested userProfileDetails.avatarAssetId -> avatarAssetUrl
    if (
      updated.userProfileDetails &&
      Object.prototype.hasOwnProperty.call(
        updated.userProfileDetails,
        "avatarAssetId"
      )
    ) {
      const nestedId = updated.userProfileDetails.avatarAssetId;
      const nestedUrl = this.assetUrlResolver.resolveAvatarUrl(nestedId);
      const { avatarAssetId: _drop, ...restProfile } =
        updated.userProfileDetails;
      updated.userProfileDetails = {
        ...restProfile,
        avatarAssetUrl: nestedUrl,
      };
    }

    return updated;
  }

  /////////////////////////////////////CURRENT ENDPOINTS//////////////////////////////////////

  @Post("register")
  async register(@Body() body: Create) {
    const createUser = new CreateUser(
      body.username,
      body.email,
      body.password,
      body.type,
      body.name
    );
    const result = await this.createUserCommandHandler.execute(createUser);
    this.handleBadRequestResult(result);
    const createdUser = await this.getOneUserByUserName.execute(
      new GetOneUserByUserName(body.username)
    );
    this.handleResult(createdUser);
    const created = createdUser.getValue().toPlainObject();
    return { user: this.addAvatarUrlToUser(created) };
  }

  @Get("profile")
  async getProfile(@Headers("authorization") auth: string) {
    const userId = await this.getCurrentUserId(auth);
    const query = new GetOneUserById(userId);
    const result = await this.getOneUserById.execute(query);
    const userObj = this.handleResult(result).toPlainObject();
    return { user: this.addAvatarUrlToUser(userObj) };
  }

  @Get("profile/id/:id")
  async getProfileById(@Param() params: FindByIdParams) {
    const query = new GetOneUserById(params.id);
    const result = await this.getOneUserById.execute(query);
    const userObj = this.handleResult(result).toPlainObjectResumed();
    return { user: this.addAvatarUrlToUser(userObj) };
  }

  @Get("profile/username/:userName")
  async getProfileByUserName(@Param() params: FindByUserNameParams) {
    const query = new GetOneUserByUserName(params.userName);
    const result = await this.getOneUserByUserName.execute(query);
    const userObj = this.handleResult(result).toPlainObjectResumed();
    return { user: this.addAvatarUrlToUser(userObj) };
  }

  @Get()
  async getAllProfiles() {
    const query = new GetAllUsers();
    const result = await this.getAllUsers.execute(query);
    return this.handleResult(result).map((user) =>
      this.addAvatarUrlToUser(user.toPlainObjectResumed())
    );
  }

  @Patch("profile")
  async editProfile(
    @Headers("authorization") auth: string,
    @Body() body: Edit
  ) {
    const userId = await this.getCurrentUserId(auth);
    const query = new GetOneUserById(userId);
    const userResult = await this.getOneUserById.execute(query);
    const user = this.handleResult(userResult);
    const editUserCommand = new EditUser(
      body.username,
      body.email,
      body.currentPassword,
      body.newPassword,
      body.confirmNewPassword,
      body.name,
      body.description,
      body.avatarAssetId,
      body.themePreference,
      user.id.value,
      userId
    );
    const editResult = await this.editUser.execute(editUserCommand);
    this.handleResult(editResult);
    const result = await this.getOneUserById.execute(query);
    const userObj = this.handleResult(result).toPlainObject();
    return { user: this.addAvatarUrlToUser(userObj) };
  }

  @Patch("profile/:id")
  async editProfileById(
    @Param() params: FindByIdParams,
    @Body() body: Edit,
    @Headers("authorization") auth: string
  ) {
    const requesterUserId = await this.getCurrentUserId(auth);
    const query = new GetOneUserById(params.id);
    const userResult = await this.getOneUserById.execute(query);
    const user = this.handleResult(userResult);

    const editUserCommand = new EditUser(
      body.username,
      body.email,
      body.currentPassword,
      body.newPassword,
      body.confirmNewPassword,
      body.name,
      body.description,
      body.avatarAssetId,
      body.themePreference,
      user.id.value,
      requesterUserId
    );
    const editResult = await this.editUser.execute(editUserCommand);
    this.handleResult(editResult);
    const result = await this.getOneUserById.execute(query);
    const userObj = this.handleResult(result).toPlainObjectResumed();
    return { user: this.addAvatarUrlToUser(userObj) };
  }

  @Delete("profile")
  async deleteProfile(@Headers("authorization") auth: string) {
    const userId = await this.getCurrentUserId(auth);
    const query = new GetOneUserById(userId);
    const userResult = await this.getOneUserById.execute(query);
    this.handleResult(userResult);
    const deleteUserCommand = new DeleteUser(userId, userId);
    const deleteResult = await this.deleteUser.execute(deleteUserCommand);
    return this.handleResult(deleteResult);
  }

  @Delete("profile/:id")
  async deleteProfileById(
    @Param() params: FindByIdParams,
    @Headers("authorization") auth: string
  ) {
    const requesterUserId = await this.getCurrentUserId(auth);
    const query = new GetOneUserById(params.id);
    const userResult = await this.getOneUserById.execute(query);
    this.handleResult(userResult);
    const deleteUserCommand = new DeleteUser(params.id, requesterUserId);
    const deleteResult = await this.deleteUser.execute(deleteUserCommand);
    return this.handleResult(deleteResult);
  }

  // Subscription endpoints moved to UserSubscriptionModule

  /////////////////////////////////////LEGACY ENDPOINTS//////////////////////////////////////

  @Get(":id")
  async getOneById(@Param() params: FindByIdParams) {
    const query = new GetOneUserById(params.id);
    const result = await this.getOneUserById.execute(query);
    const userObj = this.handleResult(result).toPlainObject();
    return this.addAvatarUrlToUser(userObj);
  }

  @Get("username/:userName")
  async getOneUserByName(@Param() params: FindByUserNameParams) {
    const query = new GetOneUserByUserName(params.userName);
    const result = await this.getOneUserByUserName.execute(query);
    const userObj = this.handleResult(result).toPlainObject();
    return this.addAvatarUrlToUser(userObj);
  }

  @Get()
  async getAll() {
    const query = new GetAllUsers();
    const result = await this.getAllUsers.execute(query);
    return this.handleResult(result).map((user) =>
      this.addAvatarUrlToUser(user.toPlainObject())
    );
  }

  @Post()
  async create(@Body() body: Create) {
    try {
      const createUser = new CreateUser(
        body.username,
        body.email,
        body.password,
        body.type,
        body.name
      );
      const result = await this.createUserCommandHandler.execute(createUser);
      return this.handleResult(result);
    } catch (error) {
      throw new InternalServerErrorException(
        "Could not create user : " + error.message
      );
    }
  }

  @Patch(":id")
  async edit(@Param() params: FindByIdParams, @Body() body: Edit) {
    const query = new GetOneUserById(params.id);
    const userResult = await this.getOneUserById.execute(query);
    const user = this.handleResult(userResult);
    const editUserCommand = new EditUser(
      body.username,
      body.email,
      body.currentPassword,
      body.newPassword,
      body.confirmNewPassword,
      body.name,
      body.description,
      body.avatarAssetId,
      body.themePreference,
      user.id.value
    );
    const editResult = await this.editUser.execute(editUserCommand);
    return this.handleResult(editResult);
  }

  @Delete(":id")
  async delete(@Param() params: FindByIdParams) {
    const query = new GetOneUserById(params.id);
    const userResult = await this.getOneUserById.execute(query);
    this.handleResult(userResult);
    const deleteUserCommand = new DeleteUser(params.id);
    const deleteResult = await this.deleteUser.execute(deleteUserCommand);
    return this.handleResult(deleteResult);
  }

  @Get("plans/list")
  async getPlans() {
    return [...Object.values(MEMBERSHIP_TYPES)];
  }

  @Get(":id/subscription")
  async getSubscriptionStatus(@Param() params: FindByIdParams) {
    const query = new GetOneUserById(params.id);
    const userResult = await this.getOneUserById.execute(query);
    const user = this.handleResult(userResult);
    return {
      membershipType: user.membership.type.value,
      status: user.membership.isEnabled() ? "enabled" : "disabled",
      expiresAt: user.membership.expiresAt.value,
    };
  }

  @Post(":id/subscription")
  async enablePremiumSubscription(@Param() params: FindByIdParams) {
    const command = new EnablePremiumMembership(params.id);
    const result = await this.enablePremiumMembership.execute(command);
    return this.handleResult(result);
  }

  @Delete(":id/subscription")
  async enableFreeSubscription(@Param() params: FindByIdParams) {
    const command = new EnableFreeMembership(params.id);
    const result = await this.enableFreeMembership.execute(command);
    return this.handleResult(result);
  }
}
