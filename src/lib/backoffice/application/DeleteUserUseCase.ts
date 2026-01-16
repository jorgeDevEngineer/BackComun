import { Inject } from "@nestjs/common";
import { UserRepository } from "../domain/port/UserRepository";
import { UserId } from "../domain/valueObject/UserId";
import { ITokenProvider } from "src/lib/auth/application/providers/ITokenProvider";
import { IHandler } from "src/lib/shared/IHandler";
import { Result } from "src/lib/shared/Type Helpers/result";
import { InvalidTokenException } from "../domain/exceptions/InvalidTokenException";
import { UnauthorizedAdminException } from "../domain/exceptions/UnauthorizedAdminException";

export interface DeleteUserCommand {
  auth: string;
  userId: string;
}

export class DeleteUserUseCase implements IHandler<DeleteUserCommand, Result<void>> {
  constructor(
    @Inject("UserRepository")
    private readonly userRepository: UserRepository,
    @Inject("ITokenProvider")
    private readonly tokenProvider: ITokenProvider,
  ) {}

  async execute(command: DeleteUserCommand): Promise<Result<void>> {
    const token = await this.tokenProvider.validateToken(command.auth);
    if (!token) {
      return Result.fail<void>(new InvalidTokenException());
    }
    
    const user = await this.userRepository.getOneById(new UserId(token.id));
    if (!user.isAdmin) {
      return Result.fail<void>(new UnauthorizedAdminException());
    }
    
    const userId = new UserId(command.userId);
    await this.userRepository.deleteUser(userId);
    return Result.ok<void>();
  }
}
