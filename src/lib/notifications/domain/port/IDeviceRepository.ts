import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { DeviceToken } from "../valueObject/DeviceToken";

export interface IDeviceRepository {
  saveToken(userId: UserId, token: DeviceToken, deviceType: string): Promise<void>;
  removeToken(userId: string, token: DeviceToken): Promise<void>;
  findAllByUserId(userId: UserId): Promise<DeviceToken[]>;
}