export class EditUser {
  constructor(
    public readonly username: string,
    public readonly email: string,
    public readonly currentPassword: string | undefined,
    public readonly newPassword: string | undefined,
    public readonly confirmNewPassword: string | undefined,
    public readonly name: string,
    public readonly description: string | undefined,
    public readonly avatarAssetUrl: string,
    public readonly themePreference: string,
    public readonly targetUserId: string,
    public readonly requesterUserId?: string
  ) {}
}
