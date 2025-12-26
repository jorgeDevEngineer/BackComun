
import { QuizRepository } from '../domain/port/QuizRepository';
import { IUseCase } from '../../../common/use-case.interface';
import { Result } from '../../../common/domain/result';
import { QuizId } from '../domain/valueObject/Quiz';

export class DeleteQuizUseCase implements IUseCase<string, Result<void>> {
  constructor(private readonly quizRepository: QuizRepository) {}

  async execute(id: string): Promise<Result<void>> {
    const quizId = QuizId.of(id);

    const existingQuiz = await this.quizRepository.find(quizId); // CORRECTED: search -> find
    if (!existingQuiz) {
      return Result.fail<void>('Quiz not found to delete');
    }

    await this.quizRepository.delete(quizId);

    return Result.ok<void>();
  }
}
