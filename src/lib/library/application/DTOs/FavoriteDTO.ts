import { IsNotEmpty, IsUUID } from "class-validator";
import { UserId } from "../../../user/domain/valueObject/UserId";

export class FavoriteDTO {
    @IsUUID()
    @IsNotEmpty()
    userId!: string;
  
    public toValueObject(): UserId {
      return new UserId(this.userId);
    }
  }
  
  