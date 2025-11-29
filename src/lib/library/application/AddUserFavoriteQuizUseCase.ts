import {UserFavoriteQuiz} from "../domain/valueObject/UserFavoriteQuiz";
import {UserFavoriteQuizRepository} from "../domain/port/UserFavoriteQuizRepository";
import {QuizId, UserId} from "src/lib/kahoot/domain/valueObject/Quiz";
import { FavoriteDTO } from "./DTOs/FavoriteDTO";

export class AddUserFavoriteQuizUseCase {
   constructor(private readonly userFavoriteQuizRepository: UserFavoriteQuizRepository) {
   }

    async run(userId: FavoriteDTO, quizId: string): Promise<void> {
        const favoriteQuiz = UserFavoriteQuiz.Of(
            userId.toValueObject(),
            QuizId.of(quizId)
        );
        await this.userFavoriteQuizRepository.addFavoriteQuiz(favoriteQuiz);
    }
}