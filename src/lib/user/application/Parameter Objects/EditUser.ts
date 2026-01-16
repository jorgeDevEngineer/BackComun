import { AuthTokenPayload } from "src/lib/auth/application/parameterObjects/TokenPayload";
export class EditUser {
  constructor(
    public readonly username: string | undefined,
    public readonly email: string | undefined,
    public readonly currentPassword: string | undefined,
    public readonly newPassword: string | undefined,
    public readonly confirmNewPassword: string | undefined,
    public readonly name: string | undefined,
    public readonly description: string | undefined,
    public readonly avatarAssetId: string | undefined,
    public readonly themePreference: string | undefined,
    public readonly targetUserId: string,
    public readonly requester?: AuthTokenPayload
  ) {}
}
