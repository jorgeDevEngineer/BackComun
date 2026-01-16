import { Inject } from "@nestjs/common";
import { UserRepository } from "../domain/port/UserRepository";
import { MassiveNotificationRepository } from "../domain/port/MassiveNotificationRepository";
import { UserId } from "../domain/valueObject/UserId";
import { ITokenProvider } from "src/lib/auth/application/providers/ITokenProvider";
import { IHandler } from "src/lib/shared/IHandler";
import { Result } from "src/lib/shared/Type Helpers/result";
import { InvalidTokenException } from "../domain/exceptions/InvalidTokenException";
import { UnauthorizedAdminException } from "../domain/exceptions/UnauthorizedAdminException";

export interface GetNotificationsCommand {
  auth: string;
  params: GetNotificationsParamsDto;
}

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

export class GetNotificationsUseCase implements IHandler<GetNotificationsCommand, Result<GetNotificationsResultDto>> {
  constructor(
    @Inject("MassiveNotificationRepository")
    private readonly massiveNotificationRepository: MassiveNotificationRepository,
    @Inject("UserRepository")
    private readonly userRepository: UserRepository,
    @Inject("ITokenProvider")
    private readonly tokenProvider: ITokenProvider,
  ) {}

  async execute(command: GetNotificationsCommand): Promise<Result<GetNotificationsResultDto>> {
    const token = await this.tokenProvider.validateToken(command.auth);
    if (!token) {
      return Result.fail<GetNotificationsResultDto>(new InvalidTokenException());
    }
    
    const user = await this.userRepository.getOneById(new UserId(token.id));
    if (!user.isAdmin) {
      return Result.fail<GetNotificationsResultDto>(new UnauthorizedAdminException());
    }
    
    const result = await this.massiveNotificationRepository.getMassiveNotifications(command.params);
    return Result.ok<GetNotificationsResultDto>(result);
  }
}
