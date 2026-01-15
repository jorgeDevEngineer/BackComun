import { IsString } from "class-validator";

export class FindByUserNameParams {
  @IsString()
  userName: string;
}
