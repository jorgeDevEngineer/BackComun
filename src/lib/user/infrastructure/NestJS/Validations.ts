import { IsOptional, IsString } from "class-validator";

export class FindByIdParams {
  @IsString()
  id: string;
}

export class FindByUserNameParams {
  @IsString()
  userName: string;
}

export class Create {
  @IsString()
  email: string;
  @IsString()
  username: string;
  @IsString()
  password: string;
  @IsString()
  name: string;
  @IsString()
  type: "student" | "teacher" | "personal";
}

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
  avatarAssetUrl: string;
  @IsString()
  themePreference: string;
}
