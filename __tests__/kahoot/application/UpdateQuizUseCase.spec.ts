
import { UpdateQuizUseCase, UpdateQuizDto } from '../../../src/lib/kahoot/application/UpdateQuizUseCase';
import { QuizRepository } from '../../../src/lib/kahoot/domain/port/QuizRepository';
import { Quiz } from '../../../src/lib/kahoot/domain/entity/Quiz';
import { Question } from '../../../src/lib/kahoot/domain/entity/Question';
import { Result } from '../../../src/common/domain/result';
import { DomainException } from '../../../src/common/domain/domain.exception';
import { QuizId, UserId } from '../../../src/lib/kahoot/domain/valueObject/Quiz';

const createValidUpdateDto = (overrides: Partial<UpdateQuizDto> = {}): UpdateQuizDto => {
  const defaultDto: UpdateQuizDto = {
    quizId: '123e4567-e89b-42d3-a456-426614174005',
    authorId: '123e4567-e89b-42d3-a456-426614174006',
    title: 'Updated Title',
    description: 'Updated Description',
    visibility: 'public',
    status: 'published',
    category: 'Science',
    themeId: '123e4567-e89b-42d3-a456-426614174007',
    coverImageId: '123e4567-e89b-42d3-a456-426614174008',
    questions: [
      {
        questionType: 'quiz',
        text: 'What is the powerhouse of the cell?',
        timeLimit: 30,
        points: 1000,
        mediaId: null,
        answers: [
          { text: 'Mitochondria', isCorrect: true, mediaId: null },
          { text: 'Nucleus', isCorrect: false, mediaId: null },
        ],
      },
    ],
  };
  return { ...defaultDto, ...overrides };
};

describe('UpdateQuizUseCase (Application Layer)', () => {
  let quizRepositoryStub: jest.Mocked<QuizRepository>;
  let mockQuiz: jest.Mocked<Quiz>;

  beforeEach(() => {
    mockQuiz = {
      id: QuizId.of('123e4567-e89b-42d3-a456-426614174005'),
      updateMetadata: jest.fn(),
      replaceQuestions: jest.fn(),
    } as unknown as jest.Mocked<Quiz>;

    quizRepositoryStub = {
      find: jest.fn().mockResolvedValue(mockQuiz),
      save: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn(),
      searchByAuthor: jest.fn(),
    };
  });

  it('should successfully update a quiz and save it', async () => {
    const useCase = new UpdateQuizUseCase(quizRepositoryStub);
    const updateDto = createValidUpdateDto();
    const result = await useCase.execute(updateDto);
    expect(result.isSuccess).toBe(true);
    expect(quizRepositoryStub.find).toHaveBeenCalledWith(QuizId.of(updateDto.quizId));
    expect(mockQuiz.updateMetadata).toHaveBeenCalledTimes(1);
    expect(mockQuiz.replaceQuestions).toHaveBeenCalledTimes(1);
    expect(quizRepositoryStub.save).toHaveBeenCalledWith(mockQuiz);
  });

  it('should THROW a DomainException if the quiz is not found', async () => {
    quizRepositoryStub.find.mockResolvedValue(null);
    const useCase = new UpdateQuizUseCase(quizRepositoryStub);
    const updateDto = createValidUpdateDto();
    await expect(useCase.execute(updateDto)).rejects.toThrow('Quiz not found');
    expect(quizRepositoryStub.save).not.toHaveBeenCalled();
  });

  it('should allow a draft quiz to be updated with missing questions', async () => {
    const useCase = new UpdateQuizUseCase(quizRepositoryStub);
    const draftDto = createValidUpdateDto({ 
        status: 'draft', 
        // A valid title is still required, but questions can be empty
        questions: []
    });
    const result = await useCase.execute(draftDto);
    expect(result.isSuccess).toBe(true);
    expect(mockQuiz.updateMetadata).toHaveBeenCalled();
    expect(mockQuiz.replaceQuestions).toHaveBeenCalledWith([]);
    expect(quizRepositoryStub.save).toHaveBeenCalled();
  });

  it('should let exceptions from entity/VO creation bubble up', async () => {
    const useCase = new UpdateQuizUseCase(quizRepositoryStub);
    const invalidDto = createValidUpdateDto({ title: 'a'.repeat(200) });
    await expect(useCase.execute(invalidDto)).rejects.toThrow(DomainException);
  });
});
