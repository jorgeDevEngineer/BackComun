import { Either } from "src/lib/shared/Either";
import { DomainException } from "../exceptions/DomainException";
import { UserFavoriteQuizNotFoundException } from "../exceptions/UserFavoriteQuizNotFoundException";
import { UserFavoriteQuizRepository } from "../port/UserFavoriteQuizRepository";
import { UserFavoriteQuiz } from "../valueObject/UserFavoriteQuiz";

export class DeleteUserFavoriteQuizDomainService {
    constructor(private readonly userFavoriteQuizRepository: UserFavoriteQuizRepository) {}
  
    async removeFavorite(userFavoriteQuiz: UserFavoriteQuiz)
      : Promise<Either<DomainException, void>> {
  
      const exists = await this.userFavoriteQuizRepository.isFavorite(
        userFavoriteQuiz.userId,
        userFavoriteQuiz.quizId
      );
  
      if (!exists) {
        return Either.makeLeft(new UserFavoriteQuizNotFoundException());
      }
  
      await this.userFavoriteQuizRepository.removeFavoriteQuiz(userFavoriteQuiz);
      return Either.makeRight(undefined);
    }
  }
  