import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from "typeorm";

@Entity("notifications")
export class NotificationEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Index() 
  @Column()
  userId: string;

  @Column({name:"type"})
  type: string; 

  @Column("text")
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  resourceId: string;

  @CreateDateColumn()
  createdAt: Date;
}