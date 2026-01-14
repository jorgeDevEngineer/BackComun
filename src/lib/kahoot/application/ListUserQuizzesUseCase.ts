
import { QuizRepository } from '../domain/port/QuizRepository';
import { Quiz } from '../domain/entity/Quiz';
import { UserId } from '../domain/valueObject/Quiz';
import { Result } from '../../shared/Type Helpers/result'; 
import { IHandler } from 'src/lib/shared/IHandler';
import { ITokenProvider } from 'src/lib/auth/application/providers/ITokenProvider';
import { UserRepository } from 'src/lib/user/domain/port/UserRepository';
import { UnauthorizedException } from '@nestjs/common';
import { UserId as UserDomainId } from '../../user/domain/valueObject/UserId';


export interface ListUserQuizzes {
    auth: string;
}

export class ListUserQuizzesUseCase implements IHandler<ListUserQuizzes, Result<Quiz[]>> {
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly tokenProvider: ITokenProvider,
    private readonly userRepository: UserRepository,
    ) {}

  async execute(request: ListUserQuizzes): Promise<Result<Quiz[]>> {
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

    const userId = UserId.of(user.id.value);

    const quizzes = await this.quizRepository.searchByAuthor(userId);
    
    return Result.ok<Quiz[]>(quizzes);
  }
}
