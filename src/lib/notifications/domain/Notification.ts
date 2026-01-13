import { Optional } from "src/lib/shared/Type Helpers/Optional";
import { notificationId } from "./valueObject/NotificationId";
import { UserId } from "src/lib/user/domain/valueObject/UserId";

export class Notification {
  private constructor(
    public readonly id: notificationId,
    public readonly userId: UserId,
    public readonly type: string, 
    public readonly message: string,
    public isRead: boolean,
    public readonly createdAt: Date,
    public readonly resourceId: Optional<string>
  ) {}

  public static create(props: {
    userId: string;
    type: string;
    title: string;
    message: string;
    resourceId?: string;
  }): Notification {
    return new Notification(
      notificationId.of(crypto.randomUUID()),
      new UserId(props.userId),
      props.type,
      props.message,
      false,
      new Date(),
      new Optional(props.resourceId)
    );
  }

  public markAsRead(isRead: boolean): void {
  this.isRead = isRead;
}

public static createFromPersistence(
    id: notificationId,
    userId: UserId,
    type: string,
    message: string,
    isRead: boolean,
    createdAt: Date,
    resourceId?: string
  ): Notification {
    return new Notification(
      id,
      userId,
      type,
      message,
      isRead,
      createdAt,
      new Optional(resourceId)
    );
  }
}


