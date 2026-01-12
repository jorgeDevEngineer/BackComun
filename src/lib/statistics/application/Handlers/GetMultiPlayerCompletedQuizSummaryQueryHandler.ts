import { IHandler } from "src/lib/shared/IHandler";
import { GetMultiPlayerCompletedQuizSummary } from "../Parameter Objects/GetMultiPlayerCompletedQuizSummary";
import { GetMultiPlayerCompletedQuizSummaryDomainService } from "../../domain/services/GetMultiPlayerCompletedQuizSummaryDomainService";
import {
  MultiQuizPersonalResult,
  toMultiQuizPersonalResult,
} from "../Response Types/MultiQuizPersonalResult";
import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { DomainUnexpectedException } from "src/lib/shared/exceptions/DomainUnexpectedException";
import { Either } from "src/lib/shared/Type Helpers/Either";

export class GetMultiPlayerCompletedQuizSummaryQueryHandler
  implements
    IHandler<
      GetMultiPlayerCompletedQuizSummary,
      Either<DomainException, MultiQuizPersonalResult>
    >
{
  constructor(
    private getCompletedQuizSummaryDomainService: GetMultiPlayerCompletedQuizSummaryDomainService
  ) {}

  async execute(
    command: GetMultiPlayerCompletedQuizSummary
  ): Promise<Either<DomainException, MultiQuizPersonalResult>> {
    const gameId = command.gameId;
    const userId = command.userId;

    try {
      const data =
        await this.getCompletedQuizSummaryDomainService.execute(gameId);
      if (data.isLeft()) {
        return Either.makeLeft(data.getLeft());
      }
      const { game, quiz } = data.getRight();
      const result = toMultiQuizPersonalResult(game, quiz, userId);
      return Either.makeRight(result);
    } catch (error) {
      return Either.makeLeft(new DomainUnexpectedException(error.message));
    }
  }
}
