import { Inject } from "@nestjs/common";
import { UserRepository } from "../domain/port/UserRepository";
import { UserId } from "../domain/valueObject/UserId";
import { ITokenProvider } from "src/lib/auth/application/providers/ITokenProvider";
import { IHandler } from "src/lib/shared/IHandler";
import { Result } from "src/lib/shared/Type Helpers/result";
import { InvalidTokenException } from "../domain/exceptions/InvalidTokenException";
import { UnauthorizedAdminException } from "../domain/exceptions/UnauthorizedAdminException";

export interface UnblockUserCommand {
  auth: string;
  userId: string;
}

export interface UnblockedUserDto {
  user: {
    id: string;
    name: string;
    email: string;
    userType: string;
    createdAt: Date;
    status: string;
  };
}

export class UnblockUserUseCase implements IHandler<UnblockUserCommand, Result<UnblockedUserDto>> {
  constructor(
    @Inject("UserRepository")
    private readonly userRepository: UserRepository,
    @Inject("ITokenProvider")
    private readonly tokenProvider: ITokenProvider,
  ) {}

  async execute(command: UnblockUserCommand): Promise<Result<UnblockedUserDto>> {
    const token = await this.tokenProvider.validateToken(command.auth);
    if (!token) {
      return Result.fail<UnblockedUserDto>(new InvalidTokenException());
    }
    
    const user = await this.userRepository.getOneById(new UserId(token.id));
    if (!user.isAdmin) {
      return Result.fail<UnblockedUserDto>(new UnauthorizedAdminException());
    }
    
    const userId = new UserId(command.userId);
    const result = await this.userRepository.UnblockUser(userId);
    return Result.ok<UnblockedUserDto>(result);
  }
}
