import { UserRepository } from "../../../domain/port/UserRepository";
import { UserId } from "../../../domain/valueObject/UserId";
import { User } from "../../../domain/aggregate/User";
import { UserNotFoundError } from "../../error/UserNotFoundError";
import { IHandler } from "src/lib/shared/IHandler";
import { GetOneUserById } from "../../Parameter Objects/GetOneUserById";

export class GetOneUserByIdQueryHandler
  implements IHandler<GetOneUserById, User | null>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetOneUserById): Promise<User | null> {
    const userId = new UserId(query.id);
    const user = await this.userRepository.getOneById(userId);
    if (!user) {
      throw new UserNotFoundError("User not found");
    }
    return user;
  }
}
