import { QuizId } from "src/lib/kahoot/domain/valueObject/Quiz";
import {UserId} from "src/lib/user/domain/valueObject/UserId";
import { Either } from "src/lib/shared/Either";
import { DomainException } from "../exceptions/DomainException";
import { QuizAlreadyFavoriteException } from "../exceptions/QuizAlreadyFavoriteException";
import { QuizNotFoundException } from "../exceptions/QuizNotFoundException";
import { QuizRepository } from "../port/QuizRepository";
import { UserFavoriteQuizRepository } from "../port/UserFavoriteQuizRepository";
import { UserFavoriteQuiz } from "../valueObject/UserFavoriteQuiz";
import { UserRepository } from "src/lib/user/domain/port/UserRepository";
import { UserNotFoundException } from "../exceptions/UserNotFoundException";

export class AddUserFavoriteQuizDomainService {
    constructor(
      private readonly userFavoriteQuizRepository: UserFavoriteQuizRepository,
      private readonly quizRepository: QuizRepository,
      private readonly userRepository: UserRepository,
    ) {}
  
    async execute(userId: UserId, quizId: QuizId)
      : Promise<Either<DomainException, void>> {
  
      const exists = await this.quizRepository.quizExists(quizId);
      if (!exists) {
        return Either.makeLeft(new QuizNotFoundException());
      }
  
      const userExits = await this.userRepository.getOneById(userId);
      if (!userExits) {
        return Either.makeLeft(new UserNotFoundException("No se puede marcar favorito un quiz para un usuario que no existe"));
      }
      
      const alreadyFavorite = await this.userFavoriteQuizRepository.isFavorite(userId, quizId);
      if (alreadyFavorite) {
        return Either.makeLeft(new QuizAlreadyFavoriteException());
      }
  
      await this.userFavoriteQuizRepository.addFavoriteQuiz(UserFavoriteQuiz.Of(userId, quizId));
      return Either.makeRight(undefined);
    }
  }
  
  