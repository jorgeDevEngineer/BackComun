
import { QuizRepository } from '../domain/port/QuizRepository';
import { Quiz } from '../domain/entity/Quiz';
import { Result } from '../../shared/Type Helpers/result';
import { QuizId } from '../domain/valueObject/Quiz';
import { IHandler } from 'src/lib/shared/IHandler';
import { ITokenProvider } from '../../auth/application/providers/ITokenProvider';
import { UserRepository } from '../../user/domain/port/UserRepository';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { UserId as UserDomainId } from '../../user/domain/valueObject/UserId';

export interface GetQuiz {
    auth: string;
    quizId: string;
}

export class GetQuizUseCase implements IHandler<GetQuiz, Result<Quiz>> {
  constructor(
      private readonly quizRepository: QuizRepository, 
      private readonly tokenProvider: ITokenProvider,
      private readonly userRepository: UserRepository,
    ) {}

  async execute(request: GetQuiz): Promise<Result<Quiz>> {
    if (!request.auth || !request.auth.startsWith('Bearer ')) {
        throw new UnauthorizedException('Missing or malformed token');
    }
    const token = request.auth.split(' ')[1];

    const decodedToken = await this.tokenProvider.validateToken(token);
    if (!decodedToken) {
        throw new UnauthorizedException('Invalid token');
    }

    const user = await this.userRepository.getOneById(UserDomainId.of(decodedToken.id));
    if (!user) {
        throw new UnauthorizedException('User not found');
    }

    const quizId = QuizId.of(request.quizId);
    const quiz = await this.quizRepository.find(quizId);

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    const quizObject = quiz.toPlainObject();

    if (quizObject.visibility === 'private' && quizObject.authorId !== user.id.value) {
        throw new UnauthorizedException('You do not have permission to access this resource');
    }

    return Result.ok<Quiz>(quiz);
  }
}
