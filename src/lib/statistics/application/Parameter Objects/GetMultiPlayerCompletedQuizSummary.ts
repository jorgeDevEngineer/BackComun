import { MultiplayerSessionId } from "src/lib/shared/domain/ids";
import { UserId } from "src/lib/user/domain/valueObject/UserId";

export class GetMultiPlayerCompletedQuizSummary {
  constructor(
    public readonly gameId: MultiplayerSessionId,
    public readonly userId: UserId
  ) {}
}
