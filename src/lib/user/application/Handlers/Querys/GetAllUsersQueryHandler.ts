import { UserRepository } from "../../../domain/port/UserRepository";
import { User } from "../../../domain/aggregate/User";
import { IHandler } from "src/lib/shared/IHandler";
import { GetAllUsers } from "../../Parameter Objects/GetAllUsers";

export class GetAllUsersQueryHandler implements IHandler<GetAllUsers, User[]> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetAllUsers): Promise<User[]> {
    return await this.userRepository.getAll();
  }
}
