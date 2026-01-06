import { UserRepository } from "../../../domain/port/UserRepository.js";
import { UserId } from "../../../domain/valueObject/UserId.js";
import { UserNotFoundError } from "../../error/UserNotFoundError.js";
import { IHandler } from "src/lib/shared/IHandler";
import { EnablePremiumMembership } from "../../Parameter Objects/EnablePremiumMembership.js";

export class EnablePremiumMembershipCommandHandler
  implements IHandler<EnablePremiumMembership, void>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: EnablePremiumMembership): Promise<void> {
    const user = await this.userRepository.getOneById(new UserId(command.id));
    if (!user) {
      throw new UserNotFoundError("User not found");
    }
    user.enablePremiumMembership();
    await this.userRepository.edit(user);
  }
}
