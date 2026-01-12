export class RegisterDeviceCommand {
  constructor(
    public readonly userId: string,
    public readonly token: string,
    public readonly deviceType: string
  ) {}
}