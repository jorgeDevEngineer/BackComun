import { UserRepository } from "../domain/port/UserRepository";
import { User } from "../domain/entity/User";
import { UserName } from "../domain/valueObject/userName";

export class GetOneUserByName {
  constructor(private readonly userRepository: UserRepository) {}
  async run(userName: string): Promise<User | null> {
    const userNameValueObject = new UserName(userName);
    return await this.userRepository.getOneByName(userNameValueObject);
  }
}
