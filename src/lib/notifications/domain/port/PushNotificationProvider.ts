import { DeviceToken } from "../valueObject/DeviceToken";

export interface IPushNotificationProvider {
  //Envía la notificación real a través de Firebase (FCM) u otro proveedor.
  
  send(tokens: DeviceToken[], title: string, body: string, data?: any): Promise<void>;
}