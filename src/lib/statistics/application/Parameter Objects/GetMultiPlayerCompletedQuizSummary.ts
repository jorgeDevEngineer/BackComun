import { MultiplayerSessionId } from "src/lib/shared/domain/ids";

export class GetMultiPlayerCompletedQuizSummary {
  constructor(public readonly gameId: MultiplayerSessionId) {}
}
