import { Either } from "../../../shared/Type Helpers/Either";
import { DomainException } from "../../../shared/exceptions/DomainException";
import { QuizzesNotFoundException } from "../../../shared/exceptions/QuizzesNotFoundException";
import { QuizPersonalResult, toQuizPersonalResult } from "../../application/Response Types/QuizPersonalResult";
import { SinglePlayerGameRepository } from "../port/SinglePlayerRepository";
import { CompletedQuizQueryCriteria } from "../../application/Response Types/CompletedQuizQueryCriteria";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";; 
import { QuizRepository } from "../../../kahoot/domain/port/QuizRepository";
import { QuizId } from "../../../kahoot/domain/valueObject/Quiz";
import { QuizNotFoundException } from "src/lib/shared/exceptions/QuizNotFoundException";

export class GetCompletedQuizSummaryDomainService {
    constructor(
        private singlePlayerGameRepository: SinglePlayerGameRepository,
        private quizRepository: QuizRepository
    ) {}

    public async execute(
        userId: UserId,
        criteria: CompletedQuizQueryCriteria
    ): Promise<Either<DomainException, QuizPersonalResult[]>>{
        
        const completedQuizzes = await this.singlePlayerGameRepository.findCompletedGames(userId, criteria);

        const results: QuizPersonalResult[] = [];

        if (completedQuizzes.length === 0) {
                return Either.makeLeft(new QuizzesNotFoundException("El usuario no ha completado nigun kahoot."));
          }

        for (const quiz of completedQuizzes) {
            const quizId = QuizId.of(quiz.getQuizId().getValue());
            const quizData =  await this.quizRepository.find(quizId);

            if (!quizData) {
                return Either.makeLeft(new QuizNotFoundException());
            }

            results.push(toQuizPersonalResult(quizData, quiz));
       }
     return Either.makeRight(results);
  } 
}