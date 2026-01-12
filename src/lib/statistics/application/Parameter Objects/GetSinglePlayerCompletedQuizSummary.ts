import { SinglePlayerGameId } from "src/lib/shared/domain/ids";

export class GetSinglePlayerCompletedQuizSummary {
  constructor(public readonly gameId: SinglePlayerGameId) {}
}
