export class DeviceToken {
  private constructor(public readonly value: string) {
    if (!value || value.trim().length < 10) {
      throw new Error("DeviceToken debe ser un token FCM válido");
    }
  }

  public static create(token: string): DeviceToken {
    return new DeviceToken(token);
  }

  public equals(other: DeviceToken): boolean {
    return this.value === other.value;
  }
}