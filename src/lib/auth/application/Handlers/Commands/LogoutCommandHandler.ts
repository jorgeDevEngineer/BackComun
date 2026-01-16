import { IHandler } from "src/lib/shared/IHandler";
import { Result } from "src/lib/shared/Type Helpers/result";
import { LogoutCommand } from "../../parameterObjects/LogoutCommand";
import { ITokenProvider } from "src/lib/auth/application/providers/ITokenProvider";
import { Inject } from "@nestjs/common";
import { DomainException } from "src/lib/shared/exceptions/domain.exception";

export class LogoutCommandHandler
  implements IHandler<LogoutCommand, Result<void>>
{
  constructor(
    @Inject("ITokenProvider") private readonly tokenProvider: ITokenProvider
  ) {}

  async execute(command: LogoutCommand): Promise<Result<void>> {
    if (!command.token || command.token.trim() === "") {
      return Result.fail(new DomainException("Token is required"));
    }
    const isValid = await this.tokenProvider.validateToken(command.token);
    if (!isValid) {
      return Result.fail(new Error("Invalid token"));
    }
    await this.tokenProvider.revokeToken(command.token);
    return Result.ok(undefined);
  }
}
