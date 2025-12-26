
import { QuizRepository } from '../domain/port/QuizRepository';
import { Quiz } from '../domain/entity/Quiz';
import { IUseCase } from '../../../common/use-case.interface';
import { Result } from '../../../common/domain/result';
import { Question } from '../domain/entity/Question';
import { Answer } from '../domain/entity/Answer';
import { MediaId as MediaIdVO } from '../../media/domain/valueObject/Media'; // CORRECTED PATH & ALIAS
import {
    QuizId, UserId, QuizTitle, QuizDescription, Visibility, QuizStatus, 
    QuizCategory, ThemeId
} from '../domain/valueObject/Quiz';
import {
    QuestionId, QuestionText, QuestionType, TimeLimit, Points
} from '../domain/valueObject/Question';
import {
    AnswerId, AnswerText, IsCorrect
} from '../domain/valueObject/Answer';

// DTOs para la entrada de datos.
export interface CreateAnswerDto {
    text: string | null;
    isCorrect: boolean;
    mediaId: string | null;
}

export interface CreateQuestion {
    text: string;
    questionType: 'quiz' | 'true_false';
    timeLimit: number;
    points: number;
    mediaId: string | null;
    answers: CreateAnswerDto[];
}

export interface CreateQuiz {
    authorId: string;
    title: string;
    description: string;
    visibility: 'public' | 'private';
    status: 'draft' | 'published';
    category: string;
    themeId: string;
    coverImageId: string | null;
    questions: CreateQuestion[];
}

export class CreateQuizUseCase implements IUseCase<CreateQuiz, Result<Quiz>> {
  constructor(private readonly quizRepository: QuizRepository) {}

  async execute(dto: CreateQuiz): Promise<Result<Quiz>> {

    // 1. Crear Value Objects para la entidad Quiz
    const authorId = UserId.of(dto.authorId);
    const title = QuizTitle.of(dto.title);
    const description = QuizDescription.of(dto.description);
    const visibility = Visibility.fromString(dto.visibility);
    const status = QuizStatus.fromString(dto.status);
    const category = QuizCategory.of(dto.category);
    const themeId = ThemeId.of(dto.themeId);
    const coverImageId = dto.coverImageId ? MediaIdVO.of(dto.coverImageId) : null;

    // 2. Crear Entidades Answer y Question a partir del DTO
    const questions: Question[] = [];
    for (const qDto of dto.questions) {
        const answers: Answer[] = [];
        for (const aDto of qDto.answers) {
            const answerId = AnswerId.generate();
            const isCorrect = IsCorrect.fromBoolean(aDto.isCorrect); // CORRECTED METHOD

            let answer: Answer;
            if (aDto.text && aDto.mediaId) {
                 return Result.fail<Quiz>('Answer cannot have both text and mediaId');
            }
            if (aDto.text) {
                answer = Answer.createTextAnswer(answerId, AnswerText.of(aDto.text), isCorrect);
            } else if (aDto.mediaId) {
                answer = Answer.createMediaAnswer(answerId, MediaIdVO.of(aDto.mediaId), isCorrect);
            } else {
                return Result.fail<Quiz>('Answer must have either text or mediaId');
            }
            answers.push(answer);
        }

        const questionId = QuestionId.generate();
        const questionText = QuestionText.of(qDto.text);
        const questionType = QuestionType.fromString(qDto.questionType);
        const timeLimit = TimeLimit.of(qDto.timeLimit);
        const points = Points.of(qDto.points);
        const questionMediaId = qDto.mediaId ? MediaIdVO.of(qDto.mediaId) : null;

        const question = Question.create(
            questionId, questionText, questionMediaId, questionType, 
            timeLimit, points, answers
        );
        questions.push(question);
    }

    // 3. Crear la entidad Raíz del Agregado (Quiz)
    const quiz = Quiz.create(
        QuizId.generate(),
        authorId,
        title,
        description,
        visibility,
        status,
        category,
        themeId,
        coverImageId,
        questions
    );

    // 4. Persistir el agregado
    await this.quizRepository.save(quiz);

    return Result.ok<Quiz>(quiz);
  }
}
