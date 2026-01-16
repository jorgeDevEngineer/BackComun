import { IHandler } from "src/lib/shared/IHandler";
import { Result } from "src/lib/shared/Type Helpers/result";
import { RegisterCommand } from "../../parameterObjects/RegisterCommand";
import { CreateUserCommandHandler } from "src/lib/user/application/Handlers/Commands/CreateUserCommandHandler";
import { CreateUser } from "src/lib/user/application/Parameter Objects/CreateUser";
import { Inject } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { DomainException } from "src/lib/shared/exceptions/domain.exception";

export class RegisterCommandHandler
  implements IHandler<RegisterCommand, Result<void>>
{
  constructor(
    @Inject(CreateUserCommandHandler)
    private readonly createUserHandler: IHandler<CreateUser, Result<void>>
  ) {}

  async execute(command: RegisterCommand): Promise<Result<void>> {
    if (!command.userName || command.userName.trim() === "") {
      return Result.fail(new DomainException("Username is required"));
    }
    if (!command.email || command.email.trim() === "") {
      return Result.fail(new DomainException("Email is required"));
    }
    if (!command.password || command.password.trim() === "") {
      return Result.fail(new DomainException("Password is required"));
    }
    const hashedPassword = await bcrypt.hash(command.password, 12);
    const createUserCommand = new CreateUser(
      command.userName,
      command.email,
      hashedPassword,
      "STUDENT",
      command.name ?? ""
    );
    return await this.createUserHandler.execute(createUserCommand);
  }
}
