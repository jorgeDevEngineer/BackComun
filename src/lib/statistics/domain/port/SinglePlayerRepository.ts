import { SinglePlayerGame } from "../../../singlePlayerGame/domain/aggregates/SinglePlayerGame"
import { UserId } from "../../../user/domain/valueObject/UserId";
import { CompletedQuizQueryCriteria } from "../../application/Response Types/CompletedQuizQueryCriteria";

export interface SinglePlayerGameRepository {

    findCompletedGames(playerId: UserId, criteria: CompletedQuizQueryCriteria):Promise<SinglePlayerGame[] | null>;
}
