
import { QuizRepository } from '../domain/port/QuizRepository';
import { Quiz } from '../domain/entity/Quiz';
import { Question } from '../domain/entity/Question';
import { Answer } from '../domain/entity/Answer';
import { QuizId, QuizTitle, QuizDescription, Visibility, ThemeId, QuizStatus, QuizCategory } from '../domain/valueObject/Quiz';
import { QuestionId, QuestionText, QuestionType, TimeLimit, Points } from '../domain/valueObject/Question';
import {
  AnswerId,
  IsCorrect,
  AnswerText,
} from '../domain/valueObject/Answer';
import { MediaId as MediaIdVO } from '../../media/domain/valueObject/Media';
import { CreateQuiz, CreateQuestion as CreateQuestionDto, CreateAnswerDto } from './CreateQuizUseCase'; // CORRECTED IMPORT
import { IUseCase } from '../../../common/use-case.interface';
import { Result } from '../../../common/domain/result';

// El DTO de Update extiende el de Create y añade el ID del quiz a actualizar
export interface UpdateQuizDto extends CreateQuiz {
  quizId: string;
}

export class UpdateQuizUseCase implements IUseCase<UpdateQuizDto, Result<Quiz>>{
  constructor(private readonly quizRepository: QuizRepository) {}

  async execute(request: UpdateQuizDto): Promise<Result<Quiz>> {
    try {
      const quizId = QuizId.of(request.quizId);
      const quiz = await this.quizRepository.find(quizId);

      if (!quiz) {
        return Result.fail<Quiz>('Quiz not found');
      }
      
      // La lógica de validación ahora usa las propiedades correctas del DTO
      const isDraft = request.status === 'draft';

      if (!isDraft && (!request.title || !request.description || !request.category)) {
        return Result.fail<Quiz>(
          'Title, description, and category are required for published quizzes.',
        );
      }

      // Actualización de Metadatos del Quiz
      quiz.updateMetadata(
        QuizTitle.of(request.title),
        QuizDescription.of(request.description),
        Visibility.fromString(request.visibility),
        QuizStatus.fromString(request.status),
        QuizCategory.of(request.category),
        ThemeId.of(request.themeId),
        request.coverImageId ? MediaIdVO.of(request.coverImageId) : null
      );

      // Reemplazo de las preguntas del Quiz
      const newQuestions: Question[] = request.questions.map((qData) => {
        if (!isDraft && !qData.text) {
          throw new Error('Question text is required for published quizzes.');
        }
        
        const answers = qData.answers.map((aData) => {
          if (!isDraft && !aData.text && !aData.mediaId) {
            throw new Error(
              'Answer text or mediaId is required for published quizzes.',
            );
          }

          if (aData.text && aData.mediaId) {
            throw new Error(
              'Cada respuesta debe tener text o mediaId, pero no ambos.',
            );
          }

          let answer: Answer;
          const answerId = AnswerId.generate();
          const isCorrect = IsCorrect.fromBoolean(aData.isCorrect);

          if (aData.text) {
            answer = Answer.createTextAnswer(answerId, AnswerText.of(aData.text), isCorrect);
          } else if (aData.mediaId) {
            answer = Answer.createMediaAnswer(answerId, MediaIdVO.of(aData.mediaId), isCorrect);
          } else {
             throw new Error('Answer must have either text or mediaId');
          }

          return answer;
        });

        return Question.create(
          QuestionId.generate(),
          QuestionText.of(qData.text),
          qData.mediaId ? MediaIdVO.of(qData.mediaId) : null,
          QuestionType.fromString(qData.questionType),
          TimeLimit.of(qData.timeLimit),
          Points.of(qData.points),
          answers,
        );
      });

      quiz.replaceQuestions(newQuestions);

      await this.quizRepository.save(quiz);

      return Result.ok<Quiz>(quiz);
    } catch (error: any) {
      return Result.fail<Quiz>(error.message);
    }
  }
}
