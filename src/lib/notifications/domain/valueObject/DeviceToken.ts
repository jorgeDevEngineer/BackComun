export class DeviceToken {
  private constructor(public readonly value: string) {
    this.validate(value);
  }
  public static create(token: string): DeviceToken {
    return new DeviceToken(token);
  }

  private validate(token: string): void {
    if (!token || token.trim().length < 10) {
      throw new Error("DeviceToken must be a valid non-empty string with at least 10 characters");
    }
  }
  public equals(other: DeviceToken): boolean {
    return this.value === other.value;
  }
}