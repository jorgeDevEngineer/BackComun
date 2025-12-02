import { UserRepository } from "../domain/port/UserRepository";
import { User } from "../domain/entity/User";

export class CreateUser {
  constructor(private readonly userRepository: UserRepository) {}

  async run(
    id: string,
    userName: string,
    email: string,
    hashedPassword: string,
    userType: "student" | "teacher" | "personal",
    avatarUrl: string,
    name?: string,
    theme?: string,
    language?: string,
    gameStreak?: number,
    createdAt?: Date,
    updatedAt?: Date
  ): Promise<void> {
    const user = new User(
      id,
      userName,
      email,
      hashedPassword,
      userType,
      avatarUrl,
      name,
      theme,
      language,
      gameStreak,
      createdAt,
      updatedAt
    );
    await this.userRepository.create(user);
  }
}
