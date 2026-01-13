import { Optional } from "src/lib/shared/Type Helpers/Optional";

export class Notification {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly type: string, 
    public readonly title: string,
    public readonly body: string,
    public isRead: boolean,
    public readonly createdAt: Date,
    public readonly resourceId: Optional<string>
  ) {}

  public static create(props: {
    userId: string;
    type: string;
    title: string;
    body: string;
    resourceId?: string;
  }): Notification {
    return new Notification(
      crypto.randomUUID(),
      props.userId,
      props.type,
      props.title,
      props.body,
      false,
      new Date(),
      new Optional(props.resourceId)
    );
  }

  public markAsRead(): void {
    this.isRead = true;
  }
}