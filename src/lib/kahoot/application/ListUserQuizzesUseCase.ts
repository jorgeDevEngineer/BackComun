
import { QuizRepository } from '../domain/port/QuizRepository';
import { Quiz } from '../domain/entity/Quiz';
import { IUseCase } from '../../../common/use-case.interface';
import { UserId } from '../domain/valueObject/Quiz';
import { Result } from '../../../common/domain/result'; // Import Result

// El caso de uso ahora devuelve un Result que envuelve el array de Quizzes
export class ListUserQuizzesUseCase implements IUseCase<string, Result<Quiz[]>> {
  constructor(private readonly quizRepository: QuizRepository) {}

  async execute(authorId: string): Promise<Result<Quiz[]>> {
    try {
      const userId = UserId.of(authorId);
      const quizzes = await this.quizRepository.searchByAuthor(userId);
      
      // Envolver el resultado exitoso en Result.ok()
      return Result.ok<Quiz[]>(quizzes);
    } catch (error: any) {
      // Si ocurre un error (p.ej. en la creación del VO), devolver un Result.fail()
      return Result.fail<Quiz[]>(error.message);
    }
  }
}
