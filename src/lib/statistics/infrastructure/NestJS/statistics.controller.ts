import { Body, Controller, Get, Inject, Param, Query } from "@nestjs/common";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "../../../shared/exceptions/DomainException";
import { IHandler } from "src/lib/shared/IHandler";
import { GetUserResults } from "../../application/Parameter Objects/GetUserResults";
import { CompletedQuizResponse } from "../../application/Response Types/CompletedQuizResponse";
import { QueryWithPaginationResponse } from "../../application/Response Types/QueryWithPaginationResponse";
import { UserIdDTO } from "../DTOs/UserIdDTO";
import { CompletedQuizQueryParams } from "../DTOs/CompletedQuizQueryParams";
import { AttemptIdDTO, SessionIdDTO } from "../DTOs/AttemptIdDTO";
import { GetSinglePlayerCompletedQuizSummary } from "../../application/Parameter Objects/GetSinglePlayerCompletedQuizSummary";
import { GetMultiPlayerCompletedQuizSummary } from "../../application/Parameter Objects/GetMultiPlayerCompletedQuizSummary";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { UserId as UserIdDomain } from "src/lib/user/domain/valueObject/UserId";
import {
  MultiplayerSessionId,
  SinglePlayerGameId,
} from "src/lib/shared/domain/ids";
import { SingleQuizPersonalResult } from "../../application/Response Types/SingleQuizPersonalResult";
import { MultiQuizPersonalResult } from "../../application/Response Types/MultiQuizPersonalResult";
import { GetSessionReport } from "../../application/Parameter Objects/GetSessionReport";
import { SessionReportResponse } from "../../application/Response Types/SessionReportResponse";

@Controller("reports")
export class StatisticsController {
  constructor(
    @Inject("GetUserResultsQueryHandler")
    private readonly getUserResults: IHandler<
      GetUserResults,
      Either<
        DomainException,
        QueryWithPaginationResponse<CompletedQuizResponse>
      >
    >,
    @Inject("GetSingleCompletedQuizSummaryQueryHandler")
    private readonly getCompletedQuizSummary: IHandler<
      GetSinglePlayerCompletedQuizSummary,
      Either<DomainException, SingleQuizPersonalResult>
    >,
    @Inject("GetSessionReportQueryHandler")
    private readonly getGameReport: IHandler<
      GetSessionReport,
      Either<DomainException, SessionReportResponse>
    >,
    @Inject("GetMultiPlayerCompletedQuizSummaryQueryHandler")
    private readonly getMultiPlayerCompletedQuizSummary: IHandler<
      GetMultiPlayerCompletedQuizSummary,
      Either<DomainException, MultiQuizPersonalResult>
    >
  ) {}

  @Get("kahoots/my-results")
  async getUserQuizResults(
    @Body() userId: UserIdDTO,
    @Query() queryParams: CompletedQuizQueryParams
  ): Promise<QueryWithPaginationResponse<CompletedQuizResponse>> {
    const playerId = UserId.of(userId.userId);
    const command = new GetUserResults(playerId, queryParams);
    const results = await this.getUserResults.execute(command);
    if (results.isLeft()) {
      throw results.getLeft();
    }
    return results.getRight();
  }

  @Get("/singleplayer/:attemptId")
  async getSinglePlayerAttemptResults(
    @Param("attemptId") attemptId: string
  ): Promise<SingleQuizPersonalResult> {
    const gameId = new AttemptIdDTO(attemptId.trim());
    const command = new GetSinglePlayerCompletedQuizSummary(
      SinglePlayerGameId.of(gameId.attemptId)
    );
    const results = await this.getCompletedQuizSummary.execute(command);
    if (results.isLeft()) {
      throw results.getLeft();
    }
    return results.getRight();
  }

  @Get("/multiplayer/:sessionId")
  async getMultiPlayerAttemptResults(
    @Param("sessionId") sessionId: string,
    @Body() userId: UserIdDTO
  ): Promise<MultiQuizPersonalResult> {
    const gameId = new SessionIdDTO(sessionId.trim());
    const command = new GetMultiPlayerCompletedQuizSummary(
      MultiplayerSessionId.of(gameId.sessionId),
      UserIdDomain.of(userId.userId)
    );
    const results =
      await this.getMultiPlayerCompletedQuizSummary.execute(command);
    if (results.isLeft()) {
      throw results.getLeft();
    }
    return results.getRight();
  }

  @Get("/sessions/:sessionid")
  async getSessionReport(
    @Param("sessionid") sessionId: string,
    @Body() userId: UserIdDTO
  ) {
    const gamenId = new SessionIdDTO(sessionId.trim());
    const command = new GetSessionReport(
      MultiplayerSessionId.of(gamenId.sessionId),
      UserIdDomain.of(userId.userId)
    );
    const results = await this.getGameReport.execute(command);
    if (results.isLeft()) {
      throw results.getLeft();
    }
    return results.getRight();
  }
}
