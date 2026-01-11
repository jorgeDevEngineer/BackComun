import { User } from "../../../domain/aggregate/User";
import { UserRepository } from "../../../domain/port/UserRepository";
import { UserDate } from "../../../domain/valueObject/UserDate";
import { UserId } from "../../../domain/valueObject/UserId";
import { UserName } from "../../../domain/valueObject/UserName";
import { UserEmail } from "../../../domain/valueObject/UserEmail";
import { UserHashedPassword } from "../../../domain/valueObject/UserHashedPassword";
import { UserType } from "../../../domain/valueObject/UserType";
import { UserAvatarUrl } from "../../../domain/valueObject/UserAvatarUrl";
import { UserPlainName } from "../../../domain/valueObject/UserPlainName";
import { UserDescription } from "../../../domain/valueObject/UserDescription";
import { UserIsAdmin } from "../../../domain/valueObject/UserIsAdmin";
import { UserRoles } from "../../../domain/valueObject/UserRoles";
import { UserTheme } from "../../../domain/valueObject/UserTheme";
import { UserLanguage } from "../../../domain/valueObject/UserLanguaje";
import { UserGameStreak } from "../../../domain/valueObject/UserGameStreak";
import { UserNotFoundException } from "../../exceptions/UserNotFoundException";
import { UserStatus } from "../../../domain/valueObject/UserStatus";
import { IHandler } from "src/lib/shared/IHandler";
import { EditUser } from "../../Parameter Objects/EditUser";
import { Result } from "src/lib/shared/Type Helpers/result";
import * as bcrypt from "bcrypt";

export class EditUserCommandHandler
  implements IHandler<EditUser, Result<void>>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: EditUser): Promise<Result<void>> {
    const existing = await this.userRepository.getOneById(
      new UserId(command.targetUserId)
    );
    if (!existing) {
      return Result.fail(new UserNotFoundException());
    }
    const userWithSameUserName = await this.userRepository.getOneByName(
      new UserName(command.username)
    );
    if (
      userWithSameUserName &&
      userWithSameUserName.id.value !== command.targetUserId
    ) {
      return Result.fail(
        new Error("That name already belongs to another user")
      );
    }
    const userWithSameEmail = await this.userRepository.getOneByEmail(
      new UserEmail(command.email)
    );
    if (
      userWithSameEmail &&
      userWithSameEmail.id.value !== command.targetUserId
    ) {
      return Result.fail(
        new Error("That email already belongs to another user")
      );
    }

    // Determine new password or keep existing
    let newHashedPassword: UserHashedPassword = existing.hashedPassword;
    if (command.newPassword && command.newPassword.trim().length > 0) {
      if (!command.currentPassword) {
        return Result.fail(new Error("Current password is required"));
      }
      const matches = await bcrypt.compare(
        command.currentPassword,
        existing.hashedPassword.value
      );
      if (!matches) {
        return Result.fail(new Error("Current password is incorrect"));
      }
      if (command.newPassword !== command.confirmNewPassword) {
        return Result.fail(
          new Error("New password confirmation does not match")
        );
      }
      newHashedPassword = new UserHashedPassword(
        await bcrypt.hash(command.newPassword, 12)
      );
    }

    const user = new User(
      new UserName(command.username),
      new UserEmail(command.email),
      newHashedPassword,
      existing.userType,
      new UserAvatarUrl(command.avatarAssetUrl),
      new UserId(command.targetUserId),
      new UserPlainName(command.name),
      new UserDescription(command.description ?? existing.description.value),
      new UserTheme(command.themePreference),
      existing.language,
      existing.gameStreak,
      existing.membership,
      existing.createdAt,
      new UserDate(new Date()),
      existing.status,
      existing.isAdmin,
      existing.roles
    );
    await this.userRepository.edit(user);
    return Result.ok(undefined);
  }
}
