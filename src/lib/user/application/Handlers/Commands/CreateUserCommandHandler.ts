import { UserRepository } from "../../../domain/port/UserRepository";
import { User } from "../../../domain/aggregate/User";
import { UserId } from "../../../domain/valueObject/UserId";
import { UserName } from "../../../domain/valueObject/UserName";
import { UserEmail } from "../../../domain/valueObject/UserEmail";
import { UserHashedPassword } from "../../../domain/valueObject/UserHashedPassword";
import { UserType } from "../../../domain/valueObject/UserType";
import { UserPlainName } from "../../../domain/valueObject/UserPlainName";
import { UserDescription } from "../../../domain/valueObject/UserDescription";
import { UserTheme } from "../../../domain/valueObject/UserTheme";
import { UserLanguage } from "../../../domain/valueObject/UserLanguaje";
import { UserGameStreak } from "../../../domain/valueObject/UserGameStreak";
import { UserDate } from "../../../domain/valueObject/UserDate";
import { Membership } from "../../../domain/entity/Membership";
import { MembershipType } from "../../../domain/valueObject/MembershipType";
import { MembershipDate } from "../../../domain/valueObject/MembershipDate";
import { UserStatus } from "../../../domain/valueObject/UserStatus";
import { IHandler } from "src/lib/shared/IHandler";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "src/lib/shared/exceptions/domain.exception";
import { CreateUser } from "../../Parameter Objects/CreateUser";
import { Result } from "src/lib/shared/Type Helpers/result";
import { UserPassword } from "../../../domain/valueObject/UserPassword";
import * as bcrypt from "bcrypt";

export class CreateUserCommandHandler
  implements IHandler<CreateUser, Result<void>>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: CreateUser): Promise<Result<void>> {
    // Basic, framework-agnostic input validation to surface missing params as domain failures
    if (
      !command.userName ||
      !command.email ||
      !command.password ||
      !command.userType ||
      !command.name
    ) {
      return Result.fail(
        new DomainException(
          "Missing required parameter(s): username, email, password, type, name"
        )
      );
    }
    const password = new UserPassword(command.password);
    const newUser = new User(
      new UserName(command.userName),
      new UserEmail(command.email),
      new UserHashedPassword(await bcrypt.hash(password.value, 12)),
      new UserType(command.userType),
      undefined,
      undefined,
      new UserPlainName(command.name),
      new UserDescription(command.description ?? "")
    );
    const userWithSameId = await this.userRepository.getOneById(newUser.id);
    if (userWithSameId) {
      return Result.fail(
        new DomainException("User with this ID already exists")
      );
    }
    const userWithSameUserName = await this.userRepository.getOneByName(
      newUser.userName
    );
    if (userWithSameUserName) {
      return Result.fail(
        new DomainException("User with this username already exists")
      );
    }
    const userWithSameEmail = await this.userRepository.getOneByEmail(
      newUser.email
    );
    if (userWithSameEmail) {
      return Result.fail(
        new DomainException("User with this email already exists")
      );
    }
    await this.userRepository.create(newUser);
    return Result.ok<void>();
  }
}
