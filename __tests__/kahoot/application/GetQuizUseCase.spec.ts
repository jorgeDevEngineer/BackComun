
import { GetQuizUseCase } from '../../../src/lib/kahoot/application/GetQuizUseCase';
import { QuizRepository } from '../../../src/lib/kahoot/domain/port/QuizRepository';
import { Quiz } from '../../../src/lib/kahoot/domain/entity/Quiz';
import { Result } from '../../../src/common/domain/result';
import { DomainException } from '../../../src/common/domain/domain.exception';
import { QuizId } from '../../../src/lib/kahoot/domain/valueObject/Quiz';

const createDummyQuiz = (id: string): Quiz => {
    const quizId = QuizId.of(id);
    return { 
        id: quizId,
        toPlainObject: () => ({ id: quizId.value }) 
    } as unknown as Quiz;
}

describe('GetQuizUseCase (Application Layer)', () => {
    let quizRepositoryStub: jest.Mocked<QuizRepository>;

    beforeEach(() => {
        quizRepositoryStub = {
            find: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            searchByAuthor: jest.fn(),
        };
    });

    it('should return a SUCCESS Result with a Quiz when the quiz is found', async () => {
        const quizId = '123e4567-e89b-42d3-a456-426614174001';
        const dummyQuiz = createDummyQuiz(quizId);
        quizRepositoryStub.find.mockResolvedValue(dummyQuiz);
        
        const useCase = new GetQuizUseCase(quizRepositoryStub);

        const result = await useCase.execute(quizId);

        expect(result.isSuccess).toBe(true);
        const returnedQuiz = result.getValue();
        expect(returnedQuiz).toBe(dummyQuiz);
        expect(returnedQuiz.id.value).toBe(quizId);
        expect(quizRepositoryStub.find).toHaveBeenCalledWith(QuizId.of(quizId));
    });

    it('should THROW a DomainException if the quiz is not found', async () => {
        const nonExistentQuizId = '123e4567-e89b-42d3-a456-426614174004';
        quizRepositoryStub.find.mockResolvedValue(null);

        const useCase = new GetQuizUseCase(quizRepositoryStub);

        await expect(useCase.execute(nonExistentQuizId)).rejects.toThrow(DomainException);
        await expect(useCase.execute(nonExistentQuizId)).rejects.toThrow('Quiz not found');
    });

    it('should let a DomainException from an invalid ID bubble up', async () => {
        const invalidId = 'invalid';
        const useCase = new GetQuizUseCase(quizRepositoryStub);

        await expect(useCase.execute(invalidId)).rejects.toThrow(DomainException);
        expect(quizRepositoryStub.find).not.toHaveBeenCalled();
    });
});
