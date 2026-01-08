import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
} from "@nestjs/common";
import { GetAllUsersQueryHandler } from "../../application/Handlers/Querys/GetAllUsersQueryHandler";
import { GetOneUserByIdQueryHandler } from "../../application/Handlers/Querys/GetOneUserByIdQueryHandler";
import { GetOneUserByUserNameQueryHandler } from "../../application/Handlers/Querys/GetOneUserByUserNameQueryHandler";
import { CreateUserCommandHandler } from "../../application/Handlers/Commands/CreateUserCommandHandler";
import { CreateUser } from "../../application/Parameter Objects/CreateUser";
import { EditUserCommandHandler } from "../../application/Handlers/Commands/EditUserCommandHandler";
import { DeleteUserCommandHandler } from "../../application/Handlers/Commands/DeleteUserCommandHandler";
import { FindByIdParams, FindByUserNameParams } from "./Validations";
import { UserNotFoundError } from "../../application/error/UserNotFoundError";
import { Create, Edit } from "./Validations";
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
import { Result } from "src/lib/shared/Type Helpers/Result";

@Controller("user")
export class UserController {
  constructor(
    @Inject("GetAllUsersQueryHandler")
    private readonly getAllUsers: GetAllUsersQueryHandler,
    @Inject("GetOneUserByIdQueryHandler")
    private readonly getOneUserById: GetOneUserByIdQueryHandler,
    @Inject("GetOneUserByUserNameQueryHandler")
    private readonly getOneUserByUserName: GetOneUserByUserNameQueryHandler,
    @Inject("CreateUserCommandHandler")
    private readonly createUserCommandHandler: CreateUserCommandHandler,
    @Inject("EditUserCommandHandler")
    private readonly editUser: EditUserCommandHandler,
    @Inject("DeleteUserCommandHandler")
    private readonly deleteUser: DeleteUserCommandHandler,
    @Inject("EnablePremiumMembershipCommandHandler")
    private readonly enablePremiumMembership: EnablePremiumMembershipCommandHandler,
    @Inject("EnableFreeMembershipCommandHandler")
    private readonly enableFreeMembership: EnableFreeMembershipCommandHandler
  ) {}

  handleResult<T>(result: Result<T>): T {
    if (result.isFailure) {
      throw new InternalServerErrorException(result.error.message);
    }
    return result.getValue()!;
  }

  @Get()
  async getAll() {
    try {
      const query = new GetAllUsers();
      return (await this.getAllUsers.execute(query)).map((user) =>
        user.toPlainObject()
      );
    } catch (error) {
      throw new InternalServerErrorException(
        "Could not fetch users: " + error.message
      );
    }
  }

  @Get(":id")
  async getOneById(@Param() params: FindByIdParams) {
    try {
      const query = new GetOneUserById(params.id);
      return (await this.getOneUserById.execute(query)).toPlainObject();
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException("User not found");
      } else {
        throw new InternalServerErrorException(
          "Could not fetch users: " + error.message
        );
      }
    }
  }

  @Get("username/:userName")
  async getOneUserByName(@Param() params: FindByUserNameParams) {
    try {
      const query = new GetOneUserByUserName(params.userName);
      return (await this.getOneUserByUserName.execute(query)).toPlainObject();
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException("User not found");
      } else {
        throw new InternalServerErrorException(
          "Could not fetch users: " + error.message
        );
      }
    }
  }

  @Post()
  async create(@Body() body: Create) {
    try {
      const createUser = new CreateUser(
        body.userName,
        body.email,
        body.hashedPassword,
        body.userType,
        body.avatarUrl
      );
      const result = await this.createUserCommandHandler.execute(createUser);
      if (result.isFailure) {
        throw result.error;
      }
      return result.getValue();
    } catch (error) {
      throw new InternalServerErrorException(
        "Could not create user : " + error.message
      );
    }
  }

  @Patch(":id")
  async edit(@Param() params: FindByIdParams, @Body() body: Edit) {
    try {
      const query = new GetOneUserById(params.id);
      const user = await this.getOneUserById.execute(query);
      const editUserCommand = new EditUser(
        body.userName,
        body.email,
        body.hashedPassword,
        body.userType,
        body.avatarUrl,
        user.id.value,
        body.name,
        body.theme,
        body.language,
        body.gameStreak,
        body.status
      );
      return await this.editUser.execute(editUserCommand);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException("User not found");
      } else {
        throw new InternalServerErrorException(
          "Could not edit user : " + error.message
        );
      }
    }
  }

  @Delete(":id")
  async delete(@Param() params: FindByIdParams) {
    try {
      const query = new GetOneUserById(params.id);
      await this.getOneUserById.execute(query);
      const deleteUserCommand = new DeleteUser(params.id);
      return await this.deleteUser.execute(deleteUserCommand);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException("User not found");
      } else {
        throw new InternalServerErrorException(
          "Could not delete user : " + error.message
        );
      }
    }
  }

  @Get("plans/list")
  async getPlans() {
    return [...Object.values(MEMBERSHIP_TYPES)];
  }

  @Get(":id/subscription")
  async getSubscriptionStatus(@Param() params: FindByIdParams) {
    try {
      const query = new GetOneUserById(params.id);
      const user = await this.getOneUserById.execute(query);
      return {
        membershipType: user.membership.type.value,
        status: user.membership.isEnabled() ? "enabled" : "disabled",
        expiresAt: user.membership.expiresAt.value,
      };
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException("User not found");
      }
    }
  }

  @Post(":id/subscription")
  async enablePremiumSubscription(@Param() params: FindByIdParams) {
    try {
      const command = new EnablePremiumMembership(params.id);
      return await this.enablePremiumMembership.execute(command);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException("User not found");
      } else {
        throw new InternalServerErrorException(
          "Could not enable premium membership: " + error.message
        );
      }
    }
  }

  @Delete(":id/subscription")
  async enableFreeSubscription(@Param() params: FindByIdParams) {
    try {
      const command = new EnableFreeMembership(params.id);
      return await this.enableFreeMembership.execute(command);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException("User not found");
      } else {
        throw new InternalServerErrorException(
          "Could not enable free membership: " + error.message
        );
      }
    }
  }
}
