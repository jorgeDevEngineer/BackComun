import { Inject } from "@nestjs/common";
import { UserRepository } from "../domain/port/UserRepository";
import { UserId } from "../domain/valueObject/UserId";
import { ITokenProvider } from "src/lib/auth/application/providers/ITokenProvider";
import { IHandler } from "src/lib/shared/IHandler";
import { Result } from "src/lib/shared/Type Helpers/result";
import { InvalidTokenException } from "../domain/exceptions/InvalidTokenException";
import { UnauthorizedAdminException } from "../domain/exceptions/UnauthorizedAdminException";

export interface GiveAdminCommand {
  auth: string;
  userId: string;
}

export interface GivenAdminRoleDto {
  user: {
    id: string;
    name: string;
    email: string;
    userType: string;
    createdAt: Date;
    status: string;
    isAdmin: boolean;
  };
}

export class GiveAdminRoleUseCase implements IHandler<GiveAdminCommand, Result<GivenAdminRoleDto>> {
  constructor(
    @Inject("UserRepository")
    private readonly userRepository: UserRepository,
    @Inject("ITokenProvider")
    private readonly tokenProvider: ITokenProvider,
  ) {}

  async execute(command: GiveAdminCommand): Promise<Result<GivenAdminRoleDto>> {
    const token = await this.tokenProvider.validateToken(command.auth);
    if (!token) {
      return Result.fail<GivenAdminRoleDto>(new InvalidTokenException());
    }
    
    const user = await this.userRepository.getOneById(new UserId(token.id));
    if (!user.isAdmin) {
      return Result.fail<GivenAdminRoleDto>(new UnauthorizedAdminException());
    }
    
    const userId = new UserId(command.userId);
    const result = await this.userRepository.GiveAdminRole(userId);
    return Result.ok<GivenAdminRoleDto>(result);
  }
}
