import {UserFavoriteQuiz} from "../domain/valueObject/UserFavoriteQuiz";
import {UserFavoriteQuizRepository} from "../domain/port/UserFavoriteQuizRepository";
import {QuizId, UserId} from "src/lib/kahoot/domain/valueObject/Quiz";

export class DeleteUserFavoriteQuizUseCase {
    constructor(
        private readonly userFavoriteQuizRepository: UserFavoriteQuizRepository,
    ) {}
    
    async execute(userId: string, quizId: string): Promise<void> {
        const userFavoriteQuiz = UserFavoriteQuiz.Of(
        UserId.of(userId),
        QuizId.of(quizId),
        );
        await this.userFavoriteQuizRepository.removeFavoriteQuiz(
        userFavoriteQuiz,
        );
    }
}