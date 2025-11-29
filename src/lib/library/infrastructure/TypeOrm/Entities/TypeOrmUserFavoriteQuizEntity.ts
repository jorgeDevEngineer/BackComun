import { Entity, Column } from 'typeorm';

@Entity('user_favorite_quizzes')
export class TypeOrmUserFavoriteQuizEntity {
  @Column()
  user_id: string;

  @Column()
  quiz_id: string;
}
