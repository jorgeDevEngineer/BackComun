import { UserRepository } from "../../../domain/port/UserRepository.js";
import { UserId } from "../../../domain/valueObject/UserId.js";
import { UserNotFoundError } from "../../error/UserNotFoundError.js";
import { IHandler } from "src/lib/shared/IHandler";
import { EnableFreeMembership } from "../../Parameter Objects/EnableFreeMembership.js";

export class EnableFreeMembershipCommandHandler
  implements IHandler<EnableFreeMembership, void>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: EnableFreeMembership): Promise<void> {
    const user = await this.userRepository.getOneById(new UserId(command.id));
    if (!user) {
      throw new UserNotFoundError("User not found");
    }
    user.enableFreeMembership();
    await this.userRepository.edit(user);
  }
}
