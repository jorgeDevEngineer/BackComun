
import { QuizRepository } from "../domain/port/QuizRepository";
import { Quiz } from "../domain/entity/Quiz";
import { Question } from "../domain/entity/Question";
import { Answer } from "../domain/entity/Answer";
import {
  QuizId,
  UserId,
  QuizTitle,
  QuizDescription,
  Visibility,
  ThemeId,
  QuizStatus,
  QuizCategory,
} from "../domain/valueObject/Quiz";
import {
  QuestionId,
  QuestionText,
  QuestionType,
  TimeLimit,
  Points,
} from "../domain/valueObject/Question";
import { AnswerId, IsCorrect, AnswerText } from "../domain/valueObject/Answer";
import { Result } from "../../shared/Type Helpers/result";
import { IHandler } from "src/lib/shared/IHandler";
import { ITokenProvider } from "src/lib/auth/application/providers/ITokenProvider";
import { UserRepository } from "src/lib/user/domain/port/UserRepository";
import { Inject, UnauthorizedException } from "@nestjs/common";
import { UserId as UserDomainId } from '../../user/domain/valueObject/UserId';

// Interfaces para el DTO de actualización...

export class UpdateQuizUseCase implements IHandler<UpdateQuiz, Result<Quiz>> {
  constructor(
    private readonly quizRepository: QuizRepository,
    @Inject("ITokenProvider")
    private readonly tokenProvider: ITokenProvider,
    @Inject("UserRepository")
    private readonly userRepository: UserRepository
  ) {}

  async execute(request: UpdateQuiz): Promise<Result<Quiz>> {
    try {
      if (!request.auth || !request.auth.startsWith('Bearer ')) {
        throw new UnauthorizedException('Missing or malformed token');
      }
      const token = request.auth.split(' ')[1];
      const decodedToken = await this.tokenProvider.validateToken(token);
      if (!decodedToken) {
        throw new UnauthorizedException("Invalid token");
      }

      const user = await this.userRepository.getOneById(UserDomainId.of(decodedToken.id));
      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      const quizId = QuizId.of(request.quizId);
      const quiz = await this.quizRepository.find(quizId);

      if (!quiz) {
        return Result.fail<Quiz>(new Error("Quiz not found"));
      }

      if (quiz.toPlainObject().authorId !== user.id.value) {
        throw new UnauthorizedException(
          "User is not the author of this quiz"
        );
      }

      const authorId = UserId.of(user.id.value);

      const title = QuizTitle.of(request.title || quiz.toPlainObject().title);
      const description = QuizDescription.of(
        request.description || quiz.toPlainObject().description
      );
      const visibility = Visibility.fromString(
        request.visibility || quiz.toPlainObject().visibility
      );
      const status = QuizStatus.fromString(
        request.status || quiz.toPlainObject().status
      );
      const category = QuizCategory.of(
        request.category || quiz.toPlainObject().category
      );
      const themeId = ThemeId.of(
        request.themeId || quiz.toPlainObject().themeId
      );
      const coverImageId = request.coverImageId;

      const newQuestions = request.questions.map((qData) => {
        const questionId = qData.id
          ? QuestionId.of(qData.id)
          : QuestionId.generate();
        const answers = (qData.answers || []).map((aData) => {
          const answerId = aData.id
            ? AnswerId.of(aData.id)
            : AnswerId.generate();
          if (aData.text) {
            return Answer.createTextAnswer(
              answerId,
              AnswerText.of(aData.text),
              IsCorrect.fromBoolean(aData.isCorrect)
            );
          } else if (aData.mediaId) {
            return Answer.createMediaAnswer(
              answerId,
              aData.mediaId,
              IsCorrect.fromBoolean(aData.isCorrect)
            );
          }
          throw new Error("Answer must have either text or mediaId");
        });

        return Question.create(
          questionId,
          QuestionText.of(qData.text),
          qData.mediaId,
          QuestionType.fromString(qData.type),
          TimeLimit.of(qData.timeLimit),
          Points.of(qData.points),
          answers
        );
      });

      quiz.update(
        authorId,
        title,
        description,
        visibility,
        status,
        category,
        themeId,
        coverImageId,
        newQuestions
      );

      await this.quizRepository.save(quiz);
      return Result.ok(quiz);
    } catch (e) {
      return Result.fail<Quiz>(e as Error);
    }
  }
}
// Las interfaces UpdateQuiz, UpdateQuestion y UpdateAnswer se omiten por brevedad
interface UpdateAnswer {
  id?: string;
  text: string;
  isCorrect: boolean;
  mediaId: string | null;
}

interface UpdateQuestion {
  id?: string;
  text: string;
  type: "single" | "multiple" | "true_false" | "quiz";
  timeLimit: number;
  points: number;
  position?: number;
  mediaId: string | null;
  answers?: UpdateAnswer[];
}

export interface UpdateQuiz {
  auth: string;
  quizId: string;
  title?: string;
  description?: string | null;
  visibility?: "public" | "private";
  status?: "draft" | "publish";
  category?: string;
  themeId?: string;
  coverImageId?: string | null;
  questions: UpdateQuestion[];
}
