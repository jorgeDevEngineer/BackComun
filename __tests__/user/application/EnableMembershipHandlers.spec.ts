import { EnablePremiumMembershipCommandHandler } from "../../../src/lib/user/application/Handlers/Commands/EnablePremiumMembershipCommandHandler";
import { EnableFreeMembershipCommandHandler } from "../../../src/lib/user/application/Handlers/Commands/EnableFreeMembershipCommandHandler";
import { EnablePremiumMembership } from "../../../src/lib/user/application/Parameter Objects/EnablePremiumMembership";
import { EnableFreeMembership } from "../../../src/lib/user/application/Parameter Objects/EnableFreeMembership";
import { UserRepository } from "../../../src/lib/user/domain/port/UserRepository";
import { User } from "../../../src/lib/user/domain/aggregate/User";
import { UserName } from "../../../src/lib/user/domain/valueObject/UserName";
import { UserEmail } from "../../../src/lib/user/domain/valueObject/UserEmail";
import { UserHashedPassword } from "../../../src/lib/user/domain/valueObject/UserHashedPassword";
import { UserType } from "../../../src/lib/user/domain/valueObject/UserType";
import { UserPlainName } from "../../../src/lib/user/domain/valueObject/UserPlainName";
import { UserDescription } from "../../../src/lib/user/domain/valueObject/UserDescription";
import { Result } from "../../../src/lib/shared/Type Helpers/result";
import { DomainException } from "../../../src/lib/shared/exceptions/domain.exception";
import { UserNotFoundException } from "../../../src/lib/user/application/exceptions/UserNotFoundException";
import { UserId } from "../../../src/lib/user/domain/valueObject/UserId";
import * as bcrypt from "bcrypt";

const makeUser = async (): Promise<User> => {
  return new User(
    new UserName("john_doe"),
    new UserEmail("john@example.com"),
    new UserHashedPassword(await bcrypt.hash("StrongPass1!", 12)),
    new UserType("STUDENT" as any),
    undefined,
    undefined,
    new UserPlainName("John"),
    new UserDescription("desc")
  );
};

describe("Enable Membership Handlers", () => {
  let repo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    repo = {
      getAll: jest.fn(),
      getOneById: jest.fn(),
      getOneByName: jest.fn(),
      getOneByEmail: jest.fn(),
      create: jest.fn(),
      edit: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn(),
    };
  });

  it("premium: fails when targetUserId is missing", async () => {
    const handler = new EnablePremiumMembershipCommandHandler(repo);
    const cmd = new EnablePremiumMembership(undefined);
    const result = await handler.execute(cmd);
    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(DomainException);
  });

  it("premium: fails when user not found", async () => {
    const handler = new EnablePremiumMembershipCommandHandler(repo);
    repo.getOneById.mockResolvedValue(null);
    const cmd = new EnablePremiumMembership(UserId.generateId().value);
    const result = await handler.execute(cmd);
    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UserNotFoundException);
  });

  it("premium: succeeds enabling premium for existing user", async () => {
    const handler = new EnablePremiumMembershipCommandHandler(repo);
    const user = await makeUser();
    repo.getOneById.mockResolvedValue(user);
    const cmd = new EnablePremiumMembership(user.id.value);
    const result = await handler.execute(cmd);
    expect(result.isSuccess).toBe(true);
    expect(repo.edit).toHaveBeenCalledTimes(1);
    expect(user.hasPremiumMembershipEnabled()).toBe(true);
  });

  it("free: fails when targetUserId is missing", async () => {
    const handler = new EnableFreeMembershipCommandHandler(repo);
    const cmd = new EnableFreeMembership(undefined);
    const result = await handler.execute(cmd);
    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(DomainException);
  });

  it("free: fails when user not found", async () => {
    const handler = new EnableFreeMembershipCommandHandler(repo);
    repo.getOneById.mockResolvedValue(null);
    const cmd = new EnableFreeMembership(UserId.generateId().value);
    const result = await handler.execute(cmd);
    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UserNotFoundException);
  });

  it("free: succeeds enabling free for existing user", async () => {
    const handler = new EnableFreeMembershipCommandHandler(repo);
    const user = await makeUser();
    repo.getOneById.mockResolvedValue(user);
    const cmd = new EnableFreeMembership(user.id.value);
    const result = await handler.execute(cmd);
    expect(result.isSuccess).toBe(true);
    expect(repo.edit).toHaveBeenCalledTimes(1);
    expect(user.hasPremiumMembershipEnabled()).toBe(false);
  });
});
