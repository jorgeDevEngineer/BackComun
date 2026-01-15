
import { QuizRepository } from '../domain/port/QuizRepository';
import { Result } from '../../shared/Type Helpers/result';
import { QuizId } from '../domain/valueObject/Quiz';
import { DomainException } from '../../shared/exceptions/domain.exception';
import { IHandler } from 'src/lib/shared/IHandler';
import { ITokenProvider } from 'src/lib/auth/application/providers/ITokenProvider';
import { UserRepository } from 'src/lib/user/domain/port/UserRepository';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { UserId as UserDomainId } from '../../user/domain/valueObject/UserId';

export interface DeleteQuiz {
    auth: string;
    quizId: string;
}

export class DeleteQuizUseCase implements IHandler<DeleteQuiz, Result<void>> {
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly tokenProvider: ITokenProvider,
    private readonly userRepository: UserRepository,
    ) {}

  async execute(request: DeleteQuiz): Promise<Result<void>> {
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

    const existingQuiz = await this.quizRepository.find(quizId);
    if (!existingQuiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (existingQuiz.toPlainObject().authorId !== user.id.value) {
        throw new UnauthorizedException('User is not the author of this quiz');
    }

    await this.quizRepository.delete(quizId);

    return Result.ok<void>();
  }
}
