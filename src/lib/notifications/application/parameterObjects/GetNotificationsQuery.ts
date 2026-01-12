export class GetNotificationsQuery {
  constructor(
    public readonly userId: string,
    public readonly limit: number,
    public readonly page: number
  ) {}
}