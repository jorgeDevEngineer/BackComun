import { QuizId, UserId } from "./Quiz";

export class UserFavoriteQuiz {
    constructor(
      public readonly userId: UserId,
      public readonly quizId: QuizId,
    ) {}
  }