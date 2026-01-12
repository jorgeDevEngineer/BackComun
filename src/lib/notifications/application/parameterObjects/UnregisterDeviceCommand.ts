export class UnregisterDeviceCommand {
  constructor(
    public readonly userId: string,
    public readonly token: string,
  ) {}
}