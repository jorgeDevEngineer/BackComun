import { Inject } from "@nestjs/common";
import { MassiveNotificationRepository } from "../domain/port/MassiveNotificationRepository";
import { UserRepository } from "../domain/port/UserRepository";
import { UserId } from "../domain/valueObject/UserId";
import { SendMailService } from "../domain/port/SendMailService";
import { ITokenProvider } from "src/lib/auth/application/providers/ITokenProvider";
import { IHandler } from "src/lib/shared/IHandler";
import { Result } from "src/lib/shared/Type Helpers/result";
import { InvalidTokenException } from "../domain/exceptions/InvalidTokenException";
import { UnauthorizedAdminException } from "../domain/exceptions/UnauthorizedAdminException";

export interface SendNotificationCommand {
  auth: string;
  body: {
    title: string;
    message: string;
    filters: {
      toAdmins: boolean;
      toRegularUsers: boolean;
    };
  };
}

export interface NotificationDto {
  title: string;
  message: string;
  userId: string;
  filters: {
    toAdmins: boolean;
    toRegularUsers: boolean;
  };
}

export interface SendNotificationDto {
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
}

export class SendNotificationUseCase implements IHandler<SendNotificationCommand, Result<SendNotificationDto>> {
  constructor(
    @Inject("MassiveNotificationRepository")
    private readonly massiveNotificationRepository: MassiveNotificationRepository,
    @Inject("UserRepository")
    private readonly userRepository: UserRepository,
    @Inject("SendMailService")
    private readonly sendMailService: SendMailService,
    @Inject("ITokenProvider")
    private readonly tokenProvider: ITokenProvider,
  ) {}

  async execute(command: SendNotificationCommand): Promise<Result<SendNotificationDto>> {
    const token = await this.tokenProvider.validateToken(command.auth);
    if (!token) {
      return Result.fail<SendNotificationDto>(new InvalidTokenException());
    }
    
    const user = await this.userRepository.getOneById(new UserId(token.id));
    if (!user.isAdmin) {
      return Result.fail<SendNotificationDto>(new UnauthorizedAdminException());
    }
    
    const data: NotificationDto = {
      title: command.body.title,
      message: command.body.message,
      userId: user.id.value,
      filters: command.body.filters,
    };

    const result = await this.massiveNotificationRepository.sendMassiveNotification(data);
    
    if (data.filters.toAdmins) {
      this.userRepository.getEmailAdmin().then((emails) => {
        emails.forEach((email) => {
          this.sendMailService.sendMail(email, result.title, result.message);
        });
      });
    }
    
    if (data.filters.toRegularUsers) {
      this.userRepository.getEmailNoadmin().then((emails) => {
        emails.forEach((email) => {
          this.sendMailService.sendMail(email, result.title, result.message);
        });
      });
    }
    
    return Result.ok<SendNotificationDto>(result);
  }
}
