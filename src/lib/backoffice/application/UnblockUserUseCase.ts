import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { UserRepository } from "../domain/port/UserRepository";
import { UserId } from "../domain/valueObject/UserId";
import { ITokenProvider } from "src/lib/auth/application/providers/ITokenProvider";

export interface UnblockedUserDto {
  user: {
    id: string;
    name: string;
    email: string;
    userType: string;
    createdAt: Date;
    status: string;
  };
}

@Injectable()
export class UnblockUserUseCase {
  constructor(
    @Inject("UserRepository")
    private readonly userRepository: UserRepository,
    @Inject("ITokenProvider")
    private readonly tokenProvider: ITokenProvider,
  ) {}

  async run(auth: string, id: string): Promise<UnblockedUserDto> {
    const token = await this.tokenProvider.validateToken(auth);
    if (!token) {
      throw new BadRequestException("Invalid token");
    }
    const user = await this.userRepository.getOneById(new UserId(token.id));
    if (!user.isAdmin) {
      throw new UnauthorizedException("Unauthorized");
    }
    const userId = new UserId(id);
    const result = await this.userRepository.UnblockUser(userId);
    return result;
  }
}
