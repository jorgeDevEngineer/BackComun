import { MassiveNotificationRepository } from "../domain/port/MassiveNotificationRepository";
import { Inject, Injectable } from "@nestjs/common";
import { MassiveNotification } from "../domain/entity/MassiveNotification";
import { UserRepository } from "../domain/port/UserRepository";
import { UserId } from "../domain/valueObject/UserId";
import { BadRequestException } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import { SendMailService } from "../domain/port/SendMailService";
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
    private readonly sendMailService: SendMailService
  ) {}

  async run(
    userheader: string,
    data: NotificationDto
  ): Promise<SendNotificationDto> {
    const user = await this.userRepository.getOneById(new UserId(userheader));
    if (!user) {
      throw new BadRequestException("User not found");
    }
    if (!user.isAdmin) {
      throw new UnauthorizedException("Unauthorized");
    }
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
