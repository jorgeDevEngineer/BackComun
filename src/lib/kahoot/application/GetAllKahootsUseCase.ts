
import { QuizRepository } from '../domain/port/QuizRepository';
import { Quiz } from '../domain/entity/Quiz';
import { Result } from '../../shared/Type Helpers/result';
import { IHandler } from 'src/lib/shared/IHandler';
import { ITokenProvider } from 'src/lib/auth/application/providers/ITokenProvider';
import { UserRepository } from 'src/lib/user/domain/port/UserRepository';
import { UnauthorizedException } from '@nestjs/common';
import { UserId as UserDomainId } from '../../user/domain/valueObject/UserId';

export interface GetAllKahoots {
    auth: string;
}

export class GetAllKahootsUseCase implements IHandler<GetAllKahoots, Result<Quiz[]>> {
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly tokenProvider: ITokenProvider,
    private readonly userRepository: UserRepository,
    ) {}

  async execute(request: GetAllKahoots): Promise<Result<Quiz[]>> {
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

    if (!user.isAdmin) {
        throw new UnauthorizedException('User is not an admin');
    }

    const quizzes = await this.quizRepository.searchByAuthor();
    
    return Result.ok<Quiz[]>(quizzes);
  }
}
