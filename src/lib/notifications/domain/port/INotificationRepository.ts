import { NotificationEntity } from "../../infrastructure/TypeOrm/NotificationEntity";

export interface INotificationRepository {
  findByUserId(userId: string, limit: number, offset: number): Promise<NotificationEntity[]>;
  save(notification: any): Promise<void>; 
}