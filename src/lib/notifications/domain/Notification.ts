export class Notification {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly type: string, // ej: "quiz_assigned"
    public readonly title: string,
    public readonly body: string,
    public isRead: boolean,
    public readonly createdAt: Date,
    public readonly resourceId?: string, // ID del Kahoot o curso
  ) {}

  // Lógica de dominio: una notificación sabe cómo cambiar su estado
  public markAsRead(): void {
    this.isRead = true;
  }
}