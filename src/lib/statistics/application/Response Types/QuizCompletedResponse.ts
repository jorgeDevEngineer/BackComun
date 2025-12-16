import { Optional } from "../../../shared/Type Helpers/Optional";

export type QuizCompletedResponse = {
    kahootId: string;
    gameId: string;
    gameType: 'Singleplayer' | 'Multiplayer';
    title: string;
    completionDate: Date;
    finalScore: number;
    rankingPosition: Optional<number>;
}