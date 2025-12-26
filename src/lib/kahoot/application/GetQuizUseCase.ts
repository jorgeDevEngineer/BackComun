
import { QuizRepository } from '../domain/port/QuizRepository';
import { Quiz } from '../domain/entity/Quiz';
import { IUseCase } from '../../../common/use-case.interface';
import { Result } from '../../../common/domain/result';
import { QuizId } from '../domain/valueObject/Quiz';

export class GetQuizUseCase implements IUseCase<string, Result<Quiz>> {
  constructor(private readonly quizRepository: QuizRepository) {}

  async execute(id: string): Promise<Result<Quiz>> {
    const quizId = QuizId.of(id);

    // CORRECTED: Changed 'search' to 'find'
    const quiz = await this.quizRepository.find(quizId);

    if (!quiz) {
      return Result.fail<Quiz>('Quiz not found');
    }

    return Result.ok<Quiz>(quiz);
  }
}
