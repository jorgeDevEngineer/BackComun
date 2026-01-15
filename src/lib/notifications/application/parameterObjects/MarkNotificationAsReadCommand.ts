export class MarkNotificationAsReadCommand {
  constructor(
    public readonly notificationId: string,
    public readonly userId: string,
    public readonly isRead: boolean, 
  ) {}
}