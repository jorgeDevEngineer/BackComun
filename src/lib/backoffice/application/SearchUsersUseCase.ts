import { Inject } from "@nestjs/common";
import { UserRepository } from "../domain/port/UserRepository";
import { UserId } from "../domain/valueObject/UserId";
import { ITokenProvider } from "src/lib/auth/application/providers/ITokenProvider";
import { IHandler } from "src/lib/shared/IHandler";
import { Result } from "src/lib/shared/Type Helpers/result";
import { InvalidTokenException } from "../domain/exceptions/InvalidTokenException";
import { UnauthorizedAdminException } from "../domain/exceptions/UnauthorizedAdminException";

export interface SearchUsersCommand {
  auth: string;
  params: SearchParamsDto;
}

export interface SearchParamsDto {
  q?: string;
  limit?: number;
  page?: number;
  orderBy?: string;
  order: "asc" | "desc";
}

export interface SearchResultDto {
  data: {
    id: string;
    name: string;
    email: string;
    userType: string;
    createdAt: Date;
    status: string;
  }[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export class SearchUsersUseCase implements IHandler<SearchUsersCommand, Result<SearchResultDto>> {
  constructor(
    @Inject("UserRepository")
    private readonly userRepository: UserRepository,
    @Inject("ITokenProvider")
    private readonly tokenProvider: ITokenProvider,
  ) {}

  async execute(command: SearchUsersCommand): Promise<Result<SearchResultDto>> {
    const token = await this.tokenProvider.validateToken(command.auth);
    if (!token) {
      return Result.fail<SearchResultDto>(new InvalidTokenException());
    }
    
    const user = await this.userRepository.getOneById(new UserId(token.id));
    if (!user.isAdmin) {
      return Result.fail<SearchResultDto>(new UnauthorizedAdminException());
    }
    
    const result = await this.userRepository.searchUsers(command.params);
    return Result.ok<SearchResultDto>(result);
  }
}
