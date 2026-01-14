import { Inject, Injectable } from "@nestjs/common";
import { UserRepository } from "../domain/port/UserRepository";
import { MassiveNotificationRepository } from "../domain/port/MassiveNotificationRepository";
import { UserId } from "../domain/valueObject/UserId";
import { BadRequestException } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import { ITokenProvider } from "src/lib/auth/application/providers/ITokenProvider";

export interface GetNotificationsParamsDto {
  userId?: string;
  limit?: number;
  page?: number;
  orderBy?: string;
  order: "asc" | "desc";
}

export interface GetNotificationsResultDto {
  data: {
    id: string;
    title: string;
    message: string;
    createdAt: Date;
    sender: {
      ImageUrl: string;
      id: string;
      name: string;
      email: string;
    };
  }[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

@Injectable()
export class GetNotificationsUseCase {
  constructor(
    @Inject("MassiveNotificationRepository")
    private readonly massiveNotificationRepository: MassiveNotificationRepository,
    @Inject("UserRepository")
    private readonly userRepository: UserRepository,
    @Inject("ITokenProvider")
    private readonly tokenProvider: ITokenProvider,
  ) {}

  async run(
    auth: string,
    params: GetNotificationsParamsDto
  ): Promise<GetNotificationsResultDto> {
    const token = await this.tokenProvider.validateToken(auth);
    if (!token) {
      throw new BadRequestException("Invalid token");
    }
    const user = await this.userRepository.getOneById(new UserId(token.id));
    if (!user.isAdmin) {
      throw new UnauthorizedException("Unauthorized");
    }
    const result = await this.massiveNotificationRepository.getMassiveNotifications(params);
    return result;
  }
}
