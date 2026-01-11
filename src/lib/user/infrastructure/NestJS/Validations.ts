import { IsOptional, IsString, Length } from "class-validator";

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
  userName: string;
  @IsString()
  email: string;
  @IsString()
  password: string;
  @IsString()
  userType: "student" | "teacher" | "personal";
  @IsString()
  avatarUrl: string;
  @IsString()
  name: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsString()
  theme: string;
  @IsString()
  language: string;
  @IsString()
  gameStreak: number;
  @IsString()
  status: "Active" | "Blocked";
}
