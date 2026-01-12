import { 
    Controller, 
    Inject, 
    Post, 
    Get,
    Body, 
    Param,
    Headers, 
    UnauthorizedException, 
    HttpException,
    HttpStatus
} from "@nestjs/common";
import { 
    SubmitGameAnswerResponseDto, 
    GameProgressResponseDto, 
    GameSummaryResponseDto, 
    StartGameResponseDto 
} from "../../application/dtos/SinglePlayerGameResponses.dto";;
import { StartGameRequestDto, SubmitGameAnswerRequestDto } from "../../application/dtos/SinglePlayerGameRequests.dto";
import { IHandler } from "src/lib/shared/IHandler";
import { StartSinglePlayerGameCommand } from "../../application/parameterObjects/StartSinglePlayerGameCommand";
import { SubmitGameAnswerCommand } from "../../application/parameterObjects/SubmitGameAnswerCommand";
import { GetGameProgressQuery } from "../../application/parameterObjects/GetGameProgressQuery";
import { GetGameSummaryQuery } from "../../application/parameterObjects/GetGameSummaryQuery";
import { ITokenProvider } from "src/lib/auth/application/providers/ITokenProvider";

@Controller('attempts')
export class SinglePlayerGameController {

    constructor(
        @Inject('StartSinglePlayerGameCommandHandler')
        private readonly StartSinglePlayerGameHandler: IHandler<StartSinglePlayerGameCommand, StartGameResponseDto>,

        @Inject('GetGameProgressQueryHandler')
        private readonly GetGameProgressHandler: IHandler<GetGameProgressQuery, GameProgressResponseDto>,

        @Inject('SubmitGameAnswerCommandHandler')
        private readonly SubmitGameAnswerHandler: IHandler<SubmitGameAnswerCommand, SubmitGameAnswerResponseDto>,

        @Inject('GetGameSummaryQueryHandler')
        private readonly GetGameSummaryHandler: IHandler<GetGameSummaryQuery, GameSummaryResponseDto>,

        @Inject("ITokenProvider") 
        private readonly tokenProvider: ITokenProvider
    ) {}

    @Post()
    async startGame(
        @Body() body: StartGameRequestDto,
        @Headers('authorization') authHeader: string
    ):Promise<StartGameResponseDto>{

        try {
            const playerId = await this.getCurrentUserId(authHeader);
            return await this.StartSinglePlayerGameHandler.execute({
                kahootId: body.kahootId,
                playerId
            });
        } catch (error) {
            if (error.message === `No se encontró el quiz de id ${body.kahootId}`) {
                throw new HttpException(`Quiz de id ${body.kahootId} no encontrado`, HttpStatus.NOT_FOUND);
            }
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get(':attemptId')
    async getProgress(
        @Param('attemptId') attemptId: string,
        @Headers('authorization') authHeader: string
    ): Promise<GameProgressResponseDto> {

        try {
            //Llamo al getCurrentUserId para validar el token aunque no lo use
            const userId = await this.getCurrentUserId(authHeader);
            return await this.GetGameProgressHandler.execute({ attemptId });
        } catch (error) {
            if (error.message === `No se encontró la partida de id ${attemptId}`) {
                throw new HttpException(`Partida de id ${attemptId} no encontrada`, HttpStatus.NOT_FOUND);
            }
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }

    }

    @Post(':attemptId/answer')
    async submitAnswer(
        @Param('attemptId') attemptId: string,
        @Body() body: SubmitGameAnswerRequestDto,
        @Headers('authorization') authHeader: string
    ): Promise<SubmitGameAnswerResponseDto> {

        try {
            //Llamo al getCurrentUserId para validar el token aunque no lo use
            const userId = await this.getCurrentUserId(authHeader);
            return await this.SubmitGameAnswerHandler.execute({
                attemptId,
                slideId: body.slideId,
                answerIndex: body.answerIndex,
                timeElapsedSeconds: body.timeElapsedSeconds
            });
        } catch (error) {
            if (error.message === `No se encontró la partida de id ${attemptId}`) {
                throw new HttpException(`Partida de id ${attemptId} no encontrada`, HttpStatus.NOT_FOUND);
            }
            if (error.message === 'La partida ya ha sido completada') {
                throw new HttpException('La partida ya ha sido completada', HttpStatus.BAD_REQUEST);
            }
            if (error.message === 'La pregunta que se quiere responder ya ha sido respondida') {
                throw new HttpException('La pregunta que se quiere responder ya ha sido respondida', HttpStatus.BAD_REQUEST);
            }
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }

    }

    @Get(':attemptId/summary')
    async getSummary(
        @Param('attemptId') attemptId: string,
        @Headers('authorization') authHeader: string
    ): Promise<GameSummaryResponseDto> {

        try {
            //Llamo al getCurrentUserId para validar el token aunque no lo use
            const userId = await this.getCurrentUserId(authHeader);
            return await this.GetGameSummaryHandler.execute({ attemptId });
        } catch (error) {
            if (error.message === `No se encontró la partida de id ${attemptId}`) {
                throw new HttpException(`Quiz de id ${attemptId} no encontrado`, HttpStatus.NOT_FOUND);
            }
            if (error.message === 'La partida no ha sido completada por lo que no se puede ver el resumen de partida') {
                throw new HttpException('La partida no ha sido completada por lo que no se puede ver el resumen de partida', HttpStatus.BAD_REQUEST);
            }
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }

    }

    private async getCurrentUserId(authHeader: string): Promise<string> {
        const token = authHeader?.replace(/^Bearer\s+/i, "");
        if (!token) {
          throw new Error("Token required");
        }
        const payload = await this.tokenProvider.validateToken(token);
        if (!payload || !payload.id) {
          throw new Error("Invalid token");
        }
        return payload.id;
      }

}