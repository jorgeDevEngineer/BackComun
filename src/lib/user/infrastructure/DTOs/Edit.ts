import { IsOptional, IsString } from "class-validator";

export class Edit {
  @IsString()
  username: string;
  @IsString()
  email: string;
  @IsOptional()
  @IsString()
  currentPassword?: string;
  @IsOptional()
  @IsString()
  newPassword?: string;
  @IsOptional()
  @IsString()
  confirmNewPassword?: string;
  @IsString()
  name: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsString()
  avatarAssetId: string;
  @IsString()
  themePreference: string;
}
