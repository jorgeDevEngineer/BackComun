
import { DeleteQuizUseCase } from '../../../src/lib/kahoot/application/DeleteQuizUseCase';
import { QuizRepository } from '../../../src/lib/kahoot/domain/port/QuizRepository';
import { Quiz } from '../../../src/lib/kahoot/domain/entity/Quiz';
import { Result } from '../../../src/common/domain/result';
import { DomainException } from '../../../src/common/domain/domain.exception';
import { QuizId } from '../../../src/lib/kahoot/domain/valueObject/Quiz';

const createDummyQuiz = (id: string): Quiz => {
    return { id: QuizId.of(id) } as unknown as Quiz;
}

describe('DeleteQuizUseCase (Application Layer)', () => {
  let quizRepositoryStub: jest.Mocked<QuizRepository>;

  beforeEach(() => {
    quizRepositoryStub = {
      find: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
      save: jest.fn(),
      searchByAuthor: jest.fn(),
    };
  });

  it('should return a SUCCESS Result when the quiz exists and is deleted', async () => {
    const quizId = '123e4567-e89b-42d3-a456-426614174010';
    const dummyQuiz = createDummyQuiz(quizId);
    quizRepositoryStub.find.mockResolvedValue(dummyQuiz);

    const useCase = new DeleteQuizUseCase(quizRepositoryStub);

    const result = await useCase.execute(quizId);

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBeNull(); // The use case returns Result.ok(null)
    expect(quizRepositoryStub.find).toHaveBeenCalledWith(QuizId.of(quizId));
    expect(quizRepositoryStub.delete).toHaveBeenCalledWith(QuizId.of(quizId));
  });

  it('should THROW a DomainException if the quiz to delete is not found', async () => {
    const nonExistentQuizId = '123e4567-e89b-42d3-a456-426614174011';
    quizRepositoryStub.find.mockResolvedValue(null);

    const useCase = new DeleteQuizUseCase(quizRepositoryStub);

    await expect(useCase.execute(nonExistentQuizId)).rejects.toThrow(DomainException);
    await expect(useCase.execute(nonExistentQuizId)).rejects.toThrow('Quiz not found');
    expect(quizRepositoryStub.delete).not.toHaveBeenCalled();
  });
  
  it('should let a DomainException from an invalid ID bubble up', async () => {
    const invalidId = 'short';
    const useCase = new DeleteQuizUseCase(quizRepositoryStub);

    await expect(useCase.execute(invalidId)).rejects.toThrow(DomainException);
  });
});
