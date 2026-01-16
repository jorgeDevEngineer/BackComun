import { UserRepository } from "../../../domain/port/UserRepository.js";
import { UserId } from "../../../domain/valueObject/UserId.js";
import { UserNotFoundException } from "../../exceptions/UserNotFoundException.js";
import { IHandler } from "src/lib/shared/IHandler";
import { EnablePremiumMembership } from "../../Parameter Objects/EnablePremiumMembership.js";
import { Result } from "src/lib/shared/Type Helpers/result";
import { DomainException } from "src/lib/shared/exceptions/domain.exception";

export class EnablePremiumMembershipCommandHandler
  implements IHandler<EnablePremiumMembership, Result<void>>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: EnablePremiumMembership): Promise<Result<void>> {
    if (!command.targetUserId) {
      return Result.fail(new DomainException("Missing required parameter: targetUserId"));
    }
    const user = await this.userRepository.getOneById(
      new UserId(command.targetUserId)
    );
    if (!user) {
      return Result.fail(new UserNotFoundException());
    }
    user.enablePremiumMembership();
    await this.userRepository.edit(user);
    return Result.ok(undefined);
  }
}
