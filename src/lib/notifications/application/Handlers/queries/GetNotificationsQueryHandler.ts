import { Inject, Injectable } from "@nestjs/common";
import { IHandler } from "src/lib/shared/IHandler"; 
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { INotificationRepository } from "../../../domain/port/INotificationRepository";
import { GetNotificationsQuery } from "../../parameterObjects/GetNotificationsQuery";
import { NotificationDto } from "../../dtos/NotificationsResponse.dto";
import { NotificationBusinessException } from "src/lib/shared/exceptions/NotificationBussinesException";

@Injectable()
export class GetNotificationsQueryHandler implements IHandler<GetNotificationsQuery, Either<DomainException, NotificationDto[]>> {
  constructor(
    @Inject('INotificationRepository')
    private readonly repository: INotificationRepository
  ) {}

  async execute(query: GetNotificationsQuery): Promise<Either<DomainException, NotificationDto[]>> {
    try {
      const offset = (query.page - 1) * query.limit;
      const entities = await this.repository.findByUserId(query.userId, query.limit, offset);
      const dtos: NotificationDto[] = entities.map((e) => ({
        id: e.id,
        type: e.type,
        message: e.message,
        isRead: e.isRead,
        createdAt: e.createdAt.toISOString(),
        resourceId: e.resourceId
      }));

      return Either.makeRight(dtos);

    } catch (error) {
      return Either.makeLeft(new NotificationBusinessException('Error al obtener las notificaciones.'));
    }
  }
}