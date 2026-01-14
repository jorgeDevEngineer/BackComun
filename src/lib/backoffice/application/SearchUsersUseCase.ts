import { Inject, Injectable } from "@nestjs/common";
import { UserRepository } from "../domain/port/UserRepository";
import { UserId } from "../domain/valueObject/UserId";
import { BadRequestException } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import { ITokenProvider } from "src/lib/auth/application/providers/ITokenProvider";

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

@Injectable()
export class SearchUsersUseCase {
  constructor(
    @Inject("UserRepository")
    private readonly userRepository: UserRepository,
    @Inject("ITokenProvider")
    private readonly tokenProvider: ITokenProvider,
  ) {}

  async run(
    auth: string,
    params: SearchParamsDto
  ): Promise<SearchResultDto> {

    const token = await this.tokenProvider.validateToken(auth);
    if (!token) {
      throw new BadRequestException("Invalid token");
    }
    const user = await this.userRepository.getOneById(new UserId(token.id));
    if (!user.isAdmin) {
      throw new UnauthorizedException("Unauthorized");
    }
    const result = await this.userRepository.searchUsers(params);
    return result;
  }
}
