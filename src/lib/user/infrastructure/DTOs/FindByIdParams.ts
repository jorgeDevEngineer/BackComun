import { IsString } from "class-validator";

export class FindByIdParams {
  @IsString()
  id: string;
}
