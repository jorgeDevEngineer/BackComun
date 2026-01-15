import { IsString } from "class-validator";

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
  type: "STUDENT" | "TEACHER";
}
