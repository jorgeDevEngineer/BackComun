import { UserRepository } from "../../../domain/port/UserRepository";
import { UserId } from "../../../domain/valueObject/UserId";
import { UserNotFoundException } from "../../exceptions/UserNotFoundException";
import { IHandler } from "src/lib/shared/IHandler";
import { EnableFreeMembership } from "../../Parameter Objects/EnableFreeMembership";
import { Result } from "src/lib/shared/Type Helpers/result";
import { DomainException } from "src/lib/shared/exceptions/domain.exception";

export class EnableFreeMembershipCommandHandler
  implements IHandler<EnableFreeMembership, Result<void>>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: EnableFreeMembership): Promise<Result<void>> {
    if (!command.targetUserId) {
      return Result.fail(
        new DomainException("Missing required parameter: targetUserId")
      );
    }
    const user = await this.userRepository.getOneById(
      new UserId(command.targetUserId)
    );
    if (!user) {
      return Result.fail(new UserNotFoundException());
    }
    user.enableFreeMembership();
    await this.userRepository.edit(user);
    return Result.ok(undefined);
  }
}
