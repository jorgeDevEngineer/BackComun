import { User } from "../../../domain/aggregate/User";
import { UserRepository } from "../../../domain/port/UserRepository";
import { UserDate } from "../../../domain/valueObject/UserDate";
import { UserId } from "../../../domain/valueObject/UserId";
import { UserName } from "../../../domain/valueObject/UserName";
import { UserEmail } from "../../../domain/valueObject/UserEmail";
import { UserHashedPassword } from "../../../domain/valueObject/UserHashedPassword";
import { UserType } from "../../../domain/valueObject/UserType";
import { UserAvatarId } from "../../../domain/valueObject/UserAvatarId";
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
import { UserPassword } from "../../../domain/valueObject/UserPassword";
import * as bcrypt from "bcrypt";
import { DomainException } from "src/lib/shared/exceptions/domain.exception";

export class EditUserCommandHandler
  implements IHandler<EditUser, Result<void>>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: EditUser): Promise<Result<void>> {
    if (!command.targetUserId) {
      return Result.fail(new DomainException("Missing required parameter: targetUserId"));
    }
    const existing = await this.userRepository.getOneById(
      new UserId(command.targetUserId)
    );
    if (!existing) {
      return Result.fail(new UserNotFoundException());
    }
    // Resolve new values, falling back to existing if omitted
    const now = new Date();
    const resolvedUsernameStr = command.username ?? existing.userName.value;
    const resolvedEmailStr = command.email ?? existing.email.value;
    const resolvedNameStr = command.name ?? existing.name.value;
    const resolvedDescriptionStr =
      command.description ?? existing.description.value;
    const resolvedAvatarIdStr =
      command.avatarAssetId ?? existing.avatarAssetId.value;
    const resolvedThemeStr = command.themePreference ?? existing.theme.value;

    // Username checks only matter if it changes
    const newUserNameVo = new UserName(resolvedUsernameStr);
    const isUserNameChanging = newUserNameVo.value !== existing.userName.value;
    if (isUserNameChanging) {
      const userWithSameUserName = await this.userRepository.getOneByName(
        new UserName(resolvedUsernameStr)
      );
      if (
        userWithSameUserName &&
        userWithSameUserName.id.value !== command.targetUserId
      ) {
        return Result.fail(
          new DomainException("That name already belongs to another user")
        );
      }
      try {
        existing.ensureCanChangeUserName(newUserNameVo, now);
      } catch (err) {
        return Result.fail(err as Error);
      }
    }

    // Email uniqueness check only if it changes
    const newEmailVo = new UserEmail(resolvedEmailStr);
    const isEmailChanging = newEmailVo.value !== existing.email.value;
    if (isEmailChanging) {
      const userWithSameEmail =
        await this.userRepository.getOneByEmail(newEmailVo);
      if (
        userWithSameEmail &&
        userWithSameEmail.id.value !== command.targetUserId
      ) {
        return Result.fail(
          new DomainException("That email already belongs to another user")
        );
      }
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
      if (command.newPassword.length < 6) {
        return Result.fail(
          new Error("New password must be at least 6 characters")
        );
      }
      const password = new UserPassword(command.newPassword);
      newHashedPassword = new UserHashedPassword(
        await bcrypt.hash(password.value, 12)
      );
    }

    const user = new User(
      new UserName(resolvedUsernameStr),
      new UserEmail(resolvedEmailStr),
      newHashedPassword,
      existing.userType,
      new UserAvatarId(resolvedAvatarIdStr),
      new UserId(command.targetUserId),
      new UserPlainName(resolvedNameStr),
      new UserDescription(resolvedDescriptionStr),
      new UserTheme(resolvedThemeStr),
      existing.language,
      existing.gameStreak,
      existing.membership,
      existing.createdAt,
      new UserDate(now),
      existing.deriveLastUserNameChangeAt(newUserNameVo, now),
      existing.status,
      existing.isAdmin,
      existing.roles
    );
    await this.userRepository.edit(user);
    return Result.ok(undefined);
  }
}
