import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { GroupOrmEntity } from "./GroupOrmEntity";

@Entity({ name: "group_members" })
export class GroupMemberOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => GroupOrmEntity, (g) => g.members, {
    onDelete: "CASCADE",
  })
  group!: GroupOrmEntity;

  @Column("uuid")
  userId!: string;

  @Column({ type: "varchar", length: 20 })
  role!: string; // "admin" | "member"

  @CreateDateColumn()
  joinedAt!: Date;

  @Column({ type: "int", default: 0 })
  completedQuizzes!: number;
}