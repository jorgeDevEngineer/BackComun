import { Notification } from "../Notification";
import { UserId } from "src/lib/user/domain/valueObject/UserId";

export interface INotificationRepository {
  //Persiste una nueva notificación en el historial.
  save(notification: Notification): Promise<void>;

  //Busca una notificación por ID (necesario para marcar como leída).
  findById(id: string): Promise<Notification | null>;

  //Obtiene el historial paginado de un usuario.
  findByUserId(userId: UserId, limit: number, offset: number): Promise<Notification[]>;

  //Actualiza el estado de una notificación.
  update(notification: Notification): Promise<void>;
}