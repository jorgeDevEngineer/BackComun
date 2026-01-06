import { UserRepository } from "../../../domain/port/UserRepository";
import { User } from "../../../domain/aggregate/User";
import { UserName } from "../../../domain/valueObject/UserName";
import { UserNotFoundError } from "../../error/UserNotFoundError";
import { IHandler } from "src/lib/shared/IHandler";
import { GetOneUserByUserName } from "../../Parameter Objects/GetOneUserByUserName";

export class GetOneUserByUserNameQueryHandler
  implements IHandler<GetOneUserByUserName, User | null>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetOneUserByUserName): Promise<User | null> {
    const userNameValueObject = new UserName(query.userName);
    const user = await this.userRepository.getOneByName(userNameValueObject);
    if (!user) {
      throw new UserNotFoundError("User not found");
    }
    return user;
  }
}
