import { EditUser } from "../../../src/lib/user/application/Parameter Objects/EditUser";

export class EditUserMother {
  static minimal(targetUserId: string): EditUser {
    return new EditUser(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      targetUserId
    );
  }

  static withEmail(targetUserId: string, email: string): EditUser {
    return new EditUser(
      undefined,
      email,
      undefined,
      undefined,
      undefined,
      "New Name",
      "New desc",
      undefined,
      "DARK",
      targetUserId
    );
  }

  static withUsername(targetUserId: string, username: string): EditUser {
    return new EditUser(
      username,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      targetUserId
    );
  }

  static withPasswordChange(
    targetUserId: string,
    currentPassword: string | undefined,
    newPassword: string,
    confirmNewPassword: string
  ): EditUser {
    return new EditUser(
      undefined,
      undefined,
      currentPassword,
      newPassword,
      confirmNewPassword,
      undefined,
      undefined,
      undefined,
      undefined,
      targetUserId
    );
  }
}
