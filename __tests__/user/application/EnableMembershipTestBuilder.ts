import { EnablePremiumMembershipCommandHandler } from "../../../src/lib/user/application/Handlers/Commands/EnablePremiumMembershipCommandHandler";
import { EnableFreeMembershipCommandHandler } from "../../../src/lib/user/application/Handlers/Commands/EnableFreeMembershipCommandHandler";
import { EnablePremiumMembership } from "../../../src/lib/user/application/Parameter Objects/EnablePremiumMembership";
import { EnableFreeMembership } from "../../../src/lib/user/application/Parameter Objects/EnableFreeMembership";
import { UserRepository } from "../../../src/lib/user/domain/port/UserRepository";
import { Result } from "../../../src/lib/shared/Type Helpers/result";
import { DomainException } from "../../../src/lib/shared/exceptions/domain.exception";
import { User } from "../../../src/lib/user/domain/aggregate/User";
import { UserMother } from "../domain/UserMother";
import { UserNotFoundException } from "../../../src/lib/user/application/exceptions/UserNotFoundException";

export class EnableMembershipTestBuilder {
  private repo: jest.Mocked<UserRepository>;
  private premiumHandler: EnablePremiumMembershipCommandHandler;
  private freeHandler: EnableFreeMembershipCommandHandler;
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
    this.premiumHandler = new EnablePremiumMembershipCommandHandler(this.repo);
    this.freeHandler = new EnableFreeMembershipCommandHandler(this.repo);
  }

  public givenUserDoesNotExist(): this {
    this.repo.getOneById.mockResolvedValue(null);
    return this;
  }

  public givenExistingUser(): User {
    const user = UserMother.createStandard();
    this.repo.getOneById.mockResolvedValue(user);
    return user;
  }

  public async whenPremiumEnabled(cmd: EnablePremiumMembership): Promise<this> {
    this.lastResult = await this.premiumHandler.execute(cmd);
    return this;
  }
  public async whenFreeEnabled(cmd: EnableFreeMembership): Promise<this> {
    this.lastResult = await this.freeHandler.execute(cmd);
    return this;
  }

  public thenShouldFailMissingId(): void {
    if (!this.lastResult) throw new Error("No result");
    expect(this.lastResult.isFailure).toBe(true);
    expect(this.lastResult.error).toBeInstanceOf(DomainException);
  }

  public thenShouldFailNotFound(): void {
    if (!this.lastResult) throw new Error("No result");
    expect(this.lastResult.isFailure).toBe(true);
    expect(this.lastResult.error).toBeInstanceOf(UserNotFoundException);
  }

  public thenPremiumShouldSucceed(user: User): void {
    if (!this.lastResult) throw new Error("No result");
    expect(this.lastResult.isSuccess).toBe(true);
    expect(this.repo.edit).toHaveBeenCalledTimes(1);
    expect(user.hasPremiumMembershipEnabled()).toBe(true);
  }
  public thenFreeShouldSucceed(user: User): void {
    if (!this.lastResult) throw new Error("No result");
    expect(this.lastResult.isSuccess).toBe(true);
    expect(this.repo.edit).toHaveBeenCalledTimes(1);
    expect(user.hasPremiumMembershipEnabled()).toBe(false);
  }
}
