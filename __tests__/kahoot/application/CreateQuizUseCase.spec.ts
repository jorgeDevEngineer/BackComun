
import { CreateQuizUseCase, CreateQuiz } from '../../../src/lib/kahoot/application/CreateQuizUseCase';
import { QuizRepository } from '../../../src/lib/kahoot/domain/port/QuizRepository';
import { Quiz } from '../../../src/lib/kahoot/domain/entity/Quiz';
import { Result } from '../../../src/common/domain/result';
import { DomainException } from '../../../src/common/domain/domain.exception';

const createValidQuizDto = (overrides: Partial<CreateQuiz> = {}): CreateQuiz => {
    const defaultDto: CreateQuiz = {
        authorId: '123e4567-e89b-42d3-a456-426614174006',
        title: 'A Valid Quiz Title',
        description: 'A valid description for the quiz.',
        visibility: 'public',
        status: 'draft',
        category: 'General Knowledge',
        themeId: '123e4567-e89b-42d3-a456-426614174007',
        coverImageId: null,
        questions: [
            {
                text: 'What is 2 + 2?',
                questionType: 'quiz',
                timeLimit: 20,
                points: 1000, // Corrected: Use a valid point value
                mediaId: null,
                answers: [
                    { text: '4', isCorrect: true, mediaId: null },
                    { text: '3', isCorrect: false, mediaId: null },
                ],
            },
        ],
    };
    return { ...defaultDto, ...overrides };
};

describe('CreateQuizUseCase (Application Layer)', () => {
    let quizRepositoryStub: jest.Mocked<QuizRepository>;

    beforeEach(() => {
        quizRepositoryStub = {
            save: jest.fn().mockResolvedValue(undefined),
            find: jest.fn(),
            delete: jest.fn(),
            searchByAuthor: jest.fn(),
        };
    });

    it('should successfully create a quiz and return a SUCCESS Result', async () => {
        const useCase = new CreateQuizUseCase(quizRepositoryStub);
        const validDto = createValidQuizDto();

        const result = await useCase.execute(validDto);

        expect(result.isSuccess).toBe(true);
        expect(quizRepositoryStub.save).toHaveBeenCalledTimes(1);
        expect(quizRepositoryStub.save).toHaveBeenCalledWith(expect.any(Quiz));

        const createdQuiz = result.getValue();
        expect(createdQuiz).toBeInstanceOf(Quiz);
        const plainQuiz = createdQuiz.toPlainObject();
        expect(plainQuiz.title).toBe(validDto.title);
    });

    it('should THROW a DomainException if an invalid authorId is provided', async () => {
        const useCase = new CreateQuizUseCase(quizRepositoryStub);
        const invalidDto = createValidQuizDto({ authorId: 'not-a-uuid' });

        await expect(useCase.execute(invalidDto)).rejects.toThrow(DomainException);
        expect(quizRepositoryStub.save).not.toHaveBeenCalled();
    });
    
    it('should THROW a DomainException if an answer has both text and mediaId', async () => {
        const useCase = new CreateQuizUseCase(quizRepositoryStub);
        const invalidDto = createValidQuizDto({
            questions: [{
                text: 'Q1',
                questionType: 'quiz', timeLimit: 20, points: 1000, mediaId: null,
                answers: [{ text: 'A1', isCorrect: true, mediaId: '123e4567-e89b-42d3-a456-426614174008' }]
            }]
        });

        await expect(useCase.execute(invalidDto)).rejects.toThrow('Answer cannot have both text and mediaId');
        expect(quizRepositoryStub.save).not.toHaveBeenCalled();
    });

    it('should THROW a DomainException if an answer has neither text nor mediaId', async () => {
        const useCase = new CreateQuizUseCase(quizRepositoryStub);
        const invalidDto = createValidQuizDto({
            questions: [{
                text: 'Q1',
                questionType: 'quiz', timeLimit: 20, points: 1000, mediaId: null,
                answers: [{ text: null, isCorrect: true, mediaId: null }]
            }]
        });

        await expect(useCase.execute(invalidDto)).rejects.toThrow('Answer must have either text or mediaId');
        expect(quizRepositoryStub.save).not.toHaveBeenCalled();
    });
    
    it('should let exceptions from nested Value Objects bubble up', async () => {
        const useCase = new CreateQuizUseCase(quizRepositoryStub);
        const invalidDto = createValidQuizDto({ title: 'a'.repeat(100) }); 

        await expect(useCase.execute(invalidDto)).rejects.toThrow(DomainException);
        expect(quizRepositoryStub.save).not.toHaveBeenCalled();
    });
});
