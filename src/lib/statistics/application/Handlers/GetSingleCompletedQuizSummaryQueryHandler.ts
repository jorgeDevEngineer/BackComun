import { IHandler } from "src/lib/shared/IHandler";
import { GetSinglePlayerCompletedQuizSummary } from "../Parameter Objects/GetSinglePlayerCompletedQuizSummary";
import { GetSingleCompletedQuizSummaryDomainService } from "../../domain/services/GetSingleCompletedQuizSummaryDomainService";
import {
  SingleQuizPersonalResult,
  toQuizPersonalResult,
} from "../Response Types/SingleQuizPersonalResult";
import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { DomainUnexpectedException } from "src/lib/shared/exceptions/DomainUnexpectedException";
import { Either } from "src/lib/shared/Type Helpers/Either";

export class GetSingleCompletedQuizSummaryQueryHandler
  implements
    IHandler<
      GetSinglePlayerCompletedQuizSummary,
      Either<DomainException, SingleQuizPersonalResult>
    >
{
  constructor(
    private getCompletedQuizSummaryDomainService: GetSingleCompletedQuizSummaryDomainService
  ) {}

  async execute(
    command: GetSinglePlayerCompletedQuizSummary
  ): Promise<Either<DomainException, SingleQuizPersonalResult>> {
    const gameId = command.gameId;

    try {
      const data =
        await this.getCompletedQuizSummaryDomainService.execute(gameId);
      if (data.isLeft()) {
        return Either.makeLeft(data.getLeft());
      }
      const { game, quiz } = data.getRight();
      const result = toQuizPersonalResult(quiz, game);
      return Either.makeRight(result);
    } catch (error) {
      return Either.makeLeft(new DomainUnexpectedException(error.message));
    }
  }
}
