import { Injectable } from "@nestjs/common";
import { TypeOrmSinglePlayerGameRepository } from "../../infrastructure/TypeOrm/TypeOrmSinglePlayerGameRepository";
import { TypeOrmQuizRepository } from "src/lib/kahoot/infrastructure/TypeOrm/TypeOrmQuizRepository";
import { StartSinglePlayerGameCommand } from "../helpers/asyncGameCommands";
import { StartGameResponseDto } from "../helpers/asyncGameResponses.dto";
import { QuizId, UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { SinglePlayerGame } from "../../domain/aggregates/SinglePlayerGame";
import { SinglePlayerGameId } from "../../domain/valueObjects/asyncGamesVO";

@Injectable()
export class startSinglePlayerGameUseCase {

    constructor(
        private readonly gameRepo: TypeOrmSinglePlayerGameRepository,
        private readonly quizRepo: TypeOrmQuizRepository
    ) {}

    async execute(command: StartSinglePlayerGameCommand): Promise<StartGameResponseDto> { 

        const activeGame = await this.gameRepo.findInProgressGameByPlayerAndQuiz(
            UserId.of(command.playerId),
            QuizId.of(command.kahootId)
        );

        //Esto no debería pasar porque el front siempre debería llamar a la ruta de este caso para iniciarlo no para retomarlo 
        // pero por si acaso
        if (activeGame) {
            throw new Error('El quiz que quieres empezar ya está activo');
        }

        const quiz = await this.quizRepo.find(QuizId.of(command.kahootId));
        if (!quiz) {
            throw new Error('Quiz not found');
        }

        const game = SinglePlayerGame.create(
            SinglePlayerGameId.generate(),
            QuizId.of(command.kahootId),
            quiz.getTotalQuestions(),
            UserId.of(command.playerId)
        );

        await this.gameRepo.save(game);

        return {
            attemptId: game.getGameId().getId(),
            firstSlide: quiz.getFirstQuestion().toResponseDto()
        };

    }

}