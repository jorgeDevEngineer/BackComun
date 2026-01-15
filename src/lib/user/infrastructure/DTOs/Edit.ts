import { IsOptional, IsString } from "class-validator";

export class Edit {
  @IsOptional()
  @IsString()
  username?: string;
  @IsOptional()
  @IsString()
  email?: string;
  @IsOptional()
  @IsString()
  currentPassword?: string;
  @IsOptional()
  @IsString()
  newPassword?: string;
  @IsOptional()
  @IsString()
  confirmNewPassword?: string;
  @IsOptional()
  @IsString()
  name?: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsString()
  avatarAssetId?: string;
  @IsOptional()
  @IsString()
  themePreference?: string;
}
