import { DeleteUserCommandHandler } from "../../../src/lib/user/application/Handlers/Commands/DeleteUserCommandHandler";
import { DeleteUser } from "../../../src/lib/user/application/Parameter Objects/DeleteUser";
import { UserRepository } from "../../../src/lib/user/domain/port/UserRepository";
import { Result } from "../../../src/lib/shared/Type Helpers/result";
import { DomainException } from "../../../src/lib/shared/exceptions/domain.exception";

export class DeleteUserTestBuilder {
  private repo: jest.Mocked<UserRepository>;
  private handler: DeleteUserCommandHandler;
  private lastResult: Result<any> | undefined;

  constructor() {
    this.repo = {
      getAll: jest.fn(),
      getOneById: jest.fn(),
      getOneByName: jest.fn(),
      getOneByEmail: jest.fn(),
      create: jest.fn(),
      edit: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    this.handler = new DeleteUserCommandHandler(this.repo);
  }

  public async whenUserIsDeleted(cmd: DeleteUser): Promise<this> {
    this.lastResult = await this.handler.execute(cmd);
    return this;
  }

  public thenShouldFailMissingId(): void {
    if (!this.lastResult) throw new Error("No result");
    expect(this.lastResult.isFailure).toBe(true);
    expect(this.lastResult.error).toBeInstanceOf(DomainException);
  }

  public thenShouldSucceed(): void {
    if (!this.lastResult) throw new Error("No result");
    expect(this.lastResult.isSuccess).toBe(true);
    expect(this.repo.delete).toHaveBeenCalledTimes(1);
  }
}
