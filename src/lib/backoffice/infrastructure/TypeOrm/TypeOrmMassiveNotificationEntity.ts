import { Column, Entity, PrimaryColumn } from "typeorm";
import { MassiveNotification } from "../../domain/entity/MassiveNotification";

@Entity("massivenotifications")
export class TypeOrmMassiveNotificationEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column()
  userId: string;

  @Column()
  createdAt: Date;
}
