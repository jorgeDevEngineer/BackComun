import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Headers,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { GetOneUserByIdQueryHandler } from "../../application/Handlers/Querys/GetOneUserByIdQueryHandler";
import { EnablePremiumMembershipCommandHandler } from "../../application/Handlers/Commands/EnablePremiumMembershipCommandHandler";
import { EnableFreeMembershipCommandHandler } from "../../application/Handlers/Commands/EnableFreeMembershipCommandHandler";
import { GetOneUserById } from "../../application/Parameter Objects/GetOneUserById";
import { EnablePremiumMembership } from "../../application/Parameter Objects/EnablePremiumMembership";
import { EnableFreeMembership } from "../../application/Parameter Objects/EnableFreeMembership";
import { Result } from "src/lib/shared/Type Helpers/result";
import { UserNotFoundException } from "../../application/exceptions/UserNotFoundException";
import { DomainException } from "src/lib/shared/exceptions/domain.exception";
import { ITokenProvider } from "src/lib/auth/application/providers/ITokenProvider";
import { FindByIdParams } from "../DTOs/FindByIdParams";
import { User } from "../../domain/aggregate/User";

@Controller("subscription")
export class UserSubscriptionController {
  constructor(
    @Inject(GetOneUserByIdQueryHandler)
    private readonly getOneUserById: GetOneUserByIdQueryHandler,
    @Inject(EnablePremiumMembershipCommandHandler)
    private readonly enablePremiumMembership: EnablePremiumMembershipCommandHandler,
    @Inject(EnableFreeMembershipCommandHandler)
    private readonly enableFreeMembership: EnableFreeMembershipCommandHandler,
    @Inject("ITokenProvider") private readonly tokenProvider: ITokenProvider
  ) {}

  private handleResult<T>(result: Result<T>): T {
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

  private buildSubscriptionResponse(user: User) {
    const plan = user.membership.type.value.toUpperCase();
    const isPremium = plan === "PREMIUM";
    const expiresAt = isPremium ? user.membership.expiresAt.value : null;
    const isExpired =
      isPremium && expiresAt
        ? new Date(expiresAt).getTime() <= Date.now()
        : false;
    const status = isPremium && isExpired ? "INACTIVE" : "ACTIVE";
    return {
      userId: user.id.value,
      plan,
      status,
      expiresAt,
    };
  }

  @Get()
  async getProfileSubscriptionStatus(@Headers("authorization") auth: string) {
    const userId = await this.tokenProvider.getUserIdFromAuthHeader(auth);
    const query = new GetOneUserById(userId);
    const userResult = await this.getOneUserById.execute(query);
    const user = this.handleResult(userResult) as User;
    return this.buildSubscriptionResponse(user);
  }

  @Get(":id")
  async getSubscriptionStatusById(@Param() params: FindByIdParams) {
    const query = new GetOneUserById(params.id);
    const userResult = await this.getOneUserById.execute(query);
    const user = this.handleResult(userResult) as User;
    return this.buildSubscriptionResponse(user);
  }

  @Post()
  async enablePremiumSubscriptionPlan(@Headers("authorization") auth: string) {
    const userId = await this.tokenProvider.getUserIdFromAuthHeader(auth);
    const command = new EnablePremiumMembership(userId, userId);
    const result = await this.enablePremiumMembership.execute(command);
    this.handleResult(result);
    const updated = await this.getOneUserById.execute(
      new GetOneUserById(userId)
    );
    const user = this.handleResult(updated) as User;
    return this.buildSubscriptionResponse(user);
  }

  @Post(":id")
  async enablePremiumSubscriptionPlanById(
    @Param() params: FindByIdParams,
    @Headers("authorization") auth: string
  ) {
    const requesterUserId = await this.tokenProvider.getUserIdFromAuthHeader(auth);
    const command = new EnablePremiumMembership(params.id, requesterUserId);
    const result = await this.enablePremiumMembership.execute(command);
    this.handleResult(result);
    const updated = await this.getOneUserById.execute(
      new GetOneUserById(params.id)
    );
    const user = this.handleResult(updated) as User;
    return this.buildSubscriptionResponse(user);
  }

  @Delete()
  async enableFreeSubscriptionPlan(@Headers("authorization") auth: string) {
    const userId = await this.tokenProvider.getUserIdFromAuthHeader(auth);
    const command = new EnableFreeMembership(userId, userId);
    const result = await this.enableFreeMembership.execute(command);
    this.handleResult(result);
    const updated = await this.getOneUserById.execute(
      new GetOneUserById(userId)
    );
    const user = this.handleResult(updated) as User;
    return this.buildSubscriptionResponse(user);
  }

  @Delete(":id")
  async enableFreeSubscriptionPlanById(
    @Param() params: FindByIdParams,
    @Headers("authorization") auth: string
  ) {
    const requesterUserId = await this.tokenProvider.getUserIdFromAuthHeader(auth);
    const command = new EnableFreeMembership(params.id, requesterUserId);
    const result = await this.enableFreeMembership.execute(command);
    this.handleResult(result);
    const updated = await this.getOneUserById.execute(
      new GetOneUserById(params.id)
    );
    const user = this.handleResult(updated) as User;
    return this.buildSubscriptionResponse(user);
  }
}
