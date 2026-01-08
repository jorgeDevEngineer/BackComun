import { Quiz } from "src/lib/kahoot/domain/entity/Quiz";
import { MultiplayerSession } from "../aggregates/MultiplayerSession";
import { IActiveMultiplayerSessionRepository } from "../repositories/IActiveMultiplayerSessionRepository";
import { IMultiplayerSessionHistoryRepository } from "../repositories/IMultiplayerSessionHistoryRepository";

export class SessionArchiverService {

    constructor(
        private historyRepo: IMultiplayerSessionHistoryRepository,
        private activeRepo: IActiveMultiplayerSessionRepository
    ){}

    async archiveAndClean( session: MultiplayerSession, quiz: Quiz ): Promise<void> {
        session.validateAllInvariantsForCompletion();

        await this.historyRepo.archiveSession(session, quiz);
        
        await this.activeRepo.delete( session.getSessionPin() );
    }
}