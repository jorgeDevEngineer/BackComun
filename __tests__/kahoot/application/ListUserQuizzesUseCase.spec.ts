
import { ListUserQuizzesUseCase } from '../../../src/lib/kahoot/application/ListUserQuizzesUseCase';
import { QuizRepository } from '../../../src/lib/kahoot/domain/port/QuizRepository';
import { Quiz } from '../../../src/lib/kahoot/domain/entity/Quiz';
import { Result } from '../../../src/common/domain/result';
import { DomainException } from '../../../src/common/domain/domain.exception';
import { UserId, QuizId } from '../../../src/lib/kahoot/domain/valueObject/Quiz';

const createDummyQuiz = (id: string): Quiz => {
    return { id: QuizId.of(id) } as Quiz;
}

describe('ListUserQuizzesUseCase (Application Layer)', () => {
    let quizRepositoryStub: jest.Mocked<QuizRepository>;

    beforeEach(() => {
        quizRepositoryStub = {
            searchByAuthor: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
        };
    });

    it('should return a SUCCESS Result with a list of quizzes for a valid author', async () => {
        const authorId = '123e4567-e89b-42d3-a456-426614174006';
        const dummyQuizzes = [createDummyQuiz('123e4567-e89b-42d3-a456-426614174001'), createDummyQuiz('123e4567-e89b-42d3-a456-426614174002')];
        quizRepositoryStub.searchByAuthor.mockResolvedValue(dummyQuizzes);

        const useCase = new ListUserQuizzesUseCase(quizRepositoryStub);

        const result = await useCase.execute(authorId);

        expect(result.isSuccess).toBe(true);
        const returnedQuizzes = result.getValue();
        expect(returnedQuizzes).toHaveLength(2);
        expect(returnedQuizzes).toBe(dummyQuizzes);
        expect(quizRepositoryStub.searchByAuthor).toHaveBeenCalledWith(UserId.of(authorId));
    });

    it('should return a SUCCESS Result with an empty list if the author has no quizzes', async () => {
        const authorId = '123e4567-e89b-42d3-a456-426614174009';
        quizRepositoryStub.searchByAuthor.mockResolvedValue([]);

        const useCase = new ListUserQuizzesUseCase(quizRepositoryStub);

        const result = await useCase.execute(authorId);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue()).toEqual([]);
        expect(quizRepositoryStub.searchByAuthor).toHaveBeenCalledWith(UserId.of(authorId));
    });

    it('should let a DomainException from an invalid author ID bubble up', async () => {
        const invalidAuthorId = 'short'; 
        const useCase = new ListUserQuizzesUseCase(quizRepositoryStub);

        await expect(useCase.execute(invalidAuthorId)).rejects.toThrow(DomainException);
        expect(quizRepositoryStub.searchByAuthor).not.toHaveBeenCalled();
    });
});
