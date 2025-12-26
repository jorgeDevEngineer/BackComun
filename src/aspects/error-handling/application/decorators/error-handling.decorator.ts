
import { IUseCase } from '../../../../common/use-case.interface';
import { Result } from '../../../../common/domain/result';
import { ILoggerPort } from '../../../logger/domain/ports/logger.port';

export class ErrorHandlingDecorator<TRequest, TResponse> implements IUseCase<TRequest, Result<TResponse>> {
  constructor(
    private readonly useCase: IUseCase<TRequest, Result<TResponse>>,
    private readonly logger: ILoggerPort,
    private readonly useCaseName: string,
  ) {}

  async execute(request: TRequest): Promise<Result<TResponse>> {
    try {
      return await this.useCase.execute(request);
    } catch (error: any) {
      this.logger.error(
        `Unexpected technical error in ${this.useCaseName}. Request: ${JSON.stringify(request)}`,
        error.stack,
      );
      return Result.fail<TResponse>('An unexpected technical error occurred.');
    }
  }
}
