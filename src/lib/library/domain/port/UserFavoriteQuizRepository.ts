import {UserFavoriteQuiz} from "../valueObject/UserFavoriteQuiz";
import { QuizId } from "../valueObject/Quiz";

export interface UserFavoriteQuizRepository {
 addFavoriteQuiz(favorite: UserFavoriteQuiz): Promise<void>;
 removeFavoriteQuiz(favorite: UserFavoriteQuiz): Promise<void>;
 findFavoritesQuizByUser(userId: string): Promise<QuizId[]>;
}
