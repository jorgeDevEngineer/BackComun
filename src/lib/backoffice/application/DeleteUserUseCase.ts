import { Inject, Injectable } from "@nestjs/common";
import { UserRepository } from "../domain/port/UserRepository";
import { UserId } from "../domain/valueObject/UserId";
import { BadRequestException } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import { ITokenProvider } from "src/lib/auth/application/providers/ITokenProvider";

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject("UserRepository")
    private readonly userRepository: UserRepository,
    @Inject("ITokenProvider")
    private readonly tokenProvider: ITokenProvider,
  ) {}

  async run(auth: string, id: string): Promise<void> {
    const token = await this.tokenProvider.validateToken(auth);
    if (!token) {
      throw new BadRequestException("Invalid token");
    }
    const user = await this.userRepository.getOneById(new UserId(token.id));
    if (!user.isAdmin) {
      throw new UnauthorizedException("Unauthorized");
    }
    const userId = new UserId(id);
    await this.userRepository.deleteUser(userId);
  }
}
