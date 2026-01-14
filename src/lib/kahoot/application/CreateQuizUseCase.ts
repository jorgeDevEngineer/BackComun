
import { QuizRepository } from '../domain/port/QuizRepository';
import { Quiz } from '../domain/entity/Quiz';
import { Result } from '../../shared/Type Helpers/result';
import { Question } from '../domain/entity/Question';
import { Answer } from '../domain/entity/Answer';
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
import { DomainException } from '../../shared/exceptions/domain.exception';
import { IHandler } from 'src/lib/shared/IHandler';
import { CreateQuestionDto } from '../infrastructure/NestJs/DTOs/create-question.dto';
import { ITokenProvider } from '../../auth/application/providers/ITokenProvider';
import { UserRepository } from '../../user/domain/port/UserRepository';
import { UnauthorizedException } from '@nestjs/common';
import { UserId as UserDomainId } from '../../user/domain/valueObject/UserId';

export interface CreateQuiz {
    auth: string;
    title: string;
    description: string;
    visibility: 'public' | 'private';
    status: 'draft' | 'publish';
    category: string;
    themeId: string;
    coverImageId: string | null;
    questions: CreateQuestionDto[];
}

export class CreateQuizUseCase implements IHandler<CreateQuiz, Result<Quiz>> {
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly tokenProvider: ITokenProvider,
    private readonly userRepository: UserRepository,
    ) {}

  async execute(dto: CreateQuiz): Promise<Result<Quiz>> {

    if (!dto.auth || !dto.auth.startsWith('Bearer ')) {
        throw new UnauthorizedException('Missing or malformed token');
    }
    const token = dto.auth.split(' ')[1];
    const decodedToken = await this.tokenProvider.validateToken(token);
    if (!decodedToken) {
        throw new UnauthorizedException('Invalid token');
    }

    const user = await this.userRepository.getOneById(UserDomainId.of(decodedToken.id));
    if (!user) {
        throw new UnauthorizedException('User not found');
    }

    const authorId = UserId.of(user.id.value);
    const title = QuizTitle.of(dto.title);
    const description = QuizDescription.of(dto.description);
    const visibility = Visibility.fromString(dto.visibility);
    const status = QuizStatus.fromString(dto.status);
    const category = QuizCategory.of(dto.category);
    const themeId = ThemeId.of(dto.themeId);
    const coverImageId = dto.coverImageId;

    const questions: Question[] = [];
    for (const qDto of dto.questions) {
        const answers: Answer[] = [];
        for (const aDto of qDto.answers) {
            if (!aDto.text && !aDto.mediaId) {
                throw new DomainException('Answer must have either text or mediaId');
            }

            const answerId = AnswerId.generate();
            const isCorrect = IsCorrect.fromBoolean(aDto.isCorrect);
            let answer: Answer;

            if (aDto.text) {
                answer = Answer.createTextAnswer(answerId, AnswerText.of(aDto.text), isCorrect);
            } else {
                answer = Answer.createMediaAnswer(answerId, aDto.mediaId!, isCorrect);
            }
            answers.push(answer);
        }

        const question = Question.create(
            QuestionId.generate(),
            QuestionText.of(qDto.text),
            qDto.mediaId, 
            QuestionType.fromString(qDto.type),
            TimeLimit.of(qDto.timeLimit),
            Points.of(qDto.points),
            answers
        );
        questions.push(question);
    }

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

    await this.quizRepository.save(quiz);

    return Result.ok<Quiz>(quiz);
  }
}
