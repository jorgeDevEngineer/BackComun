import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity("notification_devices")
export class DeviceEntity {
  // El token es la Primary Key.
  // Esto garantiza naturalmente que no haya duplicados del mismo token.
  @PrimaryColumn()
  token: string;

  @Index() 
  @Column()
  userId: string;

  @Column()
  deviceType: string; 

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}