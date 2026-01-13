import { Inject, Injectable } from "@nestjs/common";
import { IHandler } from "src/lib/shared/IHandler";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { NotificationBusinessException } from "../../../../shared/exceptions/NotificationBussinesException";

import { INotificationRepository } from "../../../domain/port/INotificationRepository";
import { notificationId } from "../../../domain/valueObject/NotificationId";
import { UserId } from "src/lib/user/domain/valueObject/UserId";

import { MarkNotificationAsReadCommand } from "../../parameterObjects/MarkNotificationAsReadCommand";
import { UpdateNotificationDto } from "../../dtos/NotificationsResponse.dto";

@Injectable()
export class MarkNotificationAsReadHandler
  implements IHandler<MarkNotificationAsReadCommand, Either<DomainException, UpdateNotificationDto>>
{
  constructor(
    @Inject('INotificationRepository') 
    private readonly notificationRepository: INotificationRepository
  ) {}

  async execute(command: MarkNotificationAsReadCommand): Promise<Either<DomainException, UpdateNotificationDto>> {
    try {
      const nId = notificationId.of(command.notificationId);
      const uId = new UserId(command.userId);
      const notificationOptional = await this.notificationRepository.findById(nId);
      
      if (!notificationOptional.hasValue()) {
        return Either.makeLeft(new NotificationBusinessException(`Notificación no encontrada`));
      }
      
      const notification = notificationOptional.getValue();
      if (notification.userId.value !== uId.value) {
        return Either.makeLeft(new NotificationBusinessException("No autorizado"));
      }
      notification.markAsRead(command.isRead);

      await this.notificationRepository.save(notification);

      return Either.makeRight({
        id: notification.id.value,
        type: notification.type,
        message: notification.message, 
        isRead: notification.isRead,
        createdAt: notification.createdAt.toISOString(),
        resourceId: notification.resourceId.getValue()

      });

    } catch (e) {
      const exception = e instanceof DomainException ? e : new NotificationBusinessException(e.message);
      return Either.makeLeft(exception);
    }
  }
}