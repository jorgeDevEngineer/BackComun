import { EditUserCommandHandler } from "../../../src/lib/user/application/Handlers/Commands/EditUserCommandHandler";
import { EditUser } from "../../../src/lib/user/application/Parameter Objects/EditUser";
import { UserRepository } from "../../../src/lib/user/domain/port/UserRepository";
import { Result } from "../../../src/lib/shared/Type Helpers/result";
import { DomainException } from "../../../src/lib/shared/exceptions/domain.exception";
import { User } from "../../../src/lib/user/domain/aggregate/User";
import { UserMother } from "../domain/UserMother";
import { UserId } from "../../../src/lib/user/domain/valueObject/UserId";

export class EditUserTestBuilder {
  private repo: jest.Mocked<UserRepository>;
  private handler: EditUserCommandHandler;
  private lastResult: Result<any> | undefined;

  constructor() {
    this.repo = {
      getAll: jest.fn(),
      getOneById: jest.fn(),
      getOneByName: jest.fn(),
      getOneByEmail: jest.fn(),
      create: jest.fn(),
      edit: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn(),
    };
    this.handler = new EditUserCommandHandler(this.repo);
  }

  public givenUserDoesNotExist(): this {
    this.repo.getOneById.mockResolvedValue(null);
    return this;
  }

  public async givenExistingUser(): Promise<User> {
    const user = UserMother.createStandard();
    this.repo.getOneById.mockResolvedValue(user);
    return user;
  }

  public givenUsernameTaken(): this {
    this.repo.getOneByName.mockResolvedValue({
      id: { value: UserId.generateId().value },
    } as any);
    return this;
  }

  public givenEmailTaken(): this {
    this.repo.getOneByEmail.mockResolvedValue({
      id: { value: UserId.generateId().value },
    } as any);
    return this;
  }

  public async whenUserIsEdited(cmd: EditUser): Promise<this> {
    this.lastResult = await this.handler.execute(cmd);
    return this;
  }

  public thenShouldFailWithDomainError(fragment?: RegExp | string): void {
    if (!this.lastResult) throw new Error("No result");
    expect(this.lastResult.isFailure).toBe(true);
    expect(this.lastResult.error).toBeInstanceOf(DomainException);
    if (fragment) {
      const msg = (this.lastResult.error as Error).message;
      const re =
        fragment instanceof RegExp ? fragment : new RegExp(fragment, "i");
      expect(msg).toMatch(re);
    }
  }

  public thenShouldFailWithError(fragment?: RegExp | string): void {
    if (!this.lastResult) throw new Error("No result");
    expect(this.lastResult.isFailure).toBe(true);
    expect(this.lastResult.error).toBeInstanceOf(Error);
    if (fragment) {
      const msg = (this.lastResult.error as Error).message;
      const re =
        fragment instanceof RegExp ? fragment : new RegExp(fragment, "i");
      expect(msg).toMatch(re);
    }
  }

  public thenShouldFailNotFound(): void {
    if (!this.lastResult) throw new Error("No result");
    expect(this.lastResult.isFailure).toBe(true);
    expect(this.lastResult.error).toBeInstanceOf(Error);
    expect(this.lastResult.error?.name ?? "").toContain("UserNotFound");
  }

  public thenShouldSucceed(): void {
    if (!this.lastResult) throw new Error("No result");
    expect(this.lastResult.isSuccess).toBe(true);
    expect(this.repo.edit).toHaveBeenCalledTimes(1);
  }
}
