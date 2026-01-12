import { Either } from "../../../shared/Type Helpers/Either";
import { DomainException } from "../../../shared/exceptions/DomainException";
import { MultiplayerSessionHistoryRepository } from "../port/MultiplayerSessionHistoryRepository";
import { QuizRepository } from "../../../kahoot/domain/port/QuizRepository";
import { QuizNotFoundException } from "src/lib/shared/exceptions/QuizNotFoundException";
import { GameNotFoundException } from "src/lib/shared/exceptions/GameNotFoundException";
import { Quiz } from "src/lib/kahoot/domain/entity/Quiz";
import { MultiplayerSession } from "src/lib/multiplayer/domain/aggregates/MultiplayerSession";
import { MultiplayerSessionId } from "src/lib/shared/domain/ids";

export class GetMultiPlayerCompletedQuizSummaryDomainService {
  constructor(
    private readonly multiPlayerRepo: MultiplayerSessionHistoryRepository,
    private readonly quizRepository: QuizRepository
  ) {}

  async execute(
    gameId: MultiplayerSessionId
  ): Promise<
    Either<DomainException, { game: MultiplayerSession; quiz: Quiz }>
  > {
    const completedGame = await this.multiPlayerRepo.findbyId(gameId);

    if (!completedGame) {
      return Either.makeLeft(
        new GameNotFoundException("No se ha encontrado la partida solicitada.")
      );
    }

    const quizId = completedGame.getQuizId();
    const quizData = await this.quizRepository.find(quizId);

    if (!quizData) {
      return Either.makeLeft(new QuizNotFoundException());
    }
    return Either.makeRight({ game: completedGame, quiz: quizData });
  }
}
