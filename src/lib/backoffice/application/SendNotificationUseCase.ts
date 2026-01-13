import { MassiveNotificationRepository } from "../domain/port/MassiveNotificationRepository";
import { Inject, Injectable } from "@nestjs/common";
import { MassiveNotification } from "../domain/entity/MassiveNotification";
import { UserRepository } from "../domain/port/UserRepository";
import { UserId } from "../domain/valueObject/UserId";
import { BadRequestException } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import { SendMailService } from "../domain/port/SendMailService";
import { ITokenProvider } from "src/lib/auth/application/providers/ITokenProvider";
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
@Injectable()
export class SendNotificationUseCase {
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

  async run(
    auth: string,
    body: {
      title: string;
      message: string;
      filters: {
        toAdmins: boolean;
        toRegularUsers: boolean;
      }
    }
  ): Promise<SendNotificationDto> {
    const token = await this.tokenProvider.validateToken(auth);
    if (!token) {
      throw new BadRequestException("Invalid token");
    }
    const user = await this.userRepository.getOneById(new UserId(token.id));
    if (!user.isAdmin) {
      throw new UnauthorizedException("Unauthorized");
    }
    const data: NotificationDto = {
      title: body.title,
      message: body.message,
      userId: user.id.value,
      filters: body.filters,
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
    return result;
  }
}
