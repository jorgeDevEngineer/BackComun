import { DeviceToken } from "../valueObject/DeviceToken"; // Lo crearemos luego
import { UserId } from "src/lib/user/domain/valueObject/UserId";

export interface IDeviceRepository {
  //Guarda un token asociado a un usuario
   
  saveToken(userId: UserId, token: DeviceToken, deviceType: string): Promise<void>;

  //Elimina un token específico.

  removeToken(token: DeviceToken): Promise<void>;

  //Recupera todos los tokens de un usuario para enviar una notificación push multidispositivo.
  findAllByUserId(userId: UserId): Promise<DeviceToken[]>;
}