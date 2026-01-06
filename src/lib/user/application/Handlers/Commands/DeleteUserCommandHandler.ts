import { UserRepository } from "../../../domain/port/UserRepository";
import { UserId } from "../../../domain/valueObject/UserId";
import { IHandler } from "src/lib/shared/IHandler";
import { DeleteUser } from "../../Parameter Objects/DeleteUser";

export class DeleteUserCommandHandler implements IHandler<DeleteUser, void> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: DeleteUser): Promise<void> {
    const userId = new UserId(command.id);
    await this.userRepository.delete(userId);
  }
}
