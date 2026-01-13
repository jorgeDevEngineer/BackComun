import { NotificationEntity } from "../../infrastructure/TypeOrm/NotificationEntity";
import { Optional } from "src/lib/shared/Type Helpers/Optional";
import { Notification } from "../Notification";
import { notificationId } from "../valueObject/NotificationId";

export interface INotificationRepository {
  findByUserId(userId: string, limit: number, offset: number): Promise<NotificationEntity[]>;
  save(notification: any): Promise<void>; 
  findById(id: notificationId): Promise<Optional<Notification>>;
}