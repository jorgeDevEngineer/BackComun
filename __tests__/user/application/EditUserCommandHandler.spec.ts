import { EditUserCommandHandler } from "../../../src/lib/user/application/Handlers/Commands/EditUserCommandHandler";
import { EditUser } from "../../../src/lib/user/application/Parameter Objects/EditUser";
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
import * as bcrypt from "bcrypt";
import { UserId } from "../../../src/lib/user/domain/valueObject/UserId";

const makeUser = async (overrides: Partial<User> = {}) => {
  const base = new User(
    new UserName("john_doe"),
    new UserEmail("john@example.com"),
    new UserHashedPassword(await bcrypt.hash("StrongPass1!", 12)),
    new UserType("STUDENT" as any),
    undefined,
    undefined,
    new UserPlainName("John"),
    new UserDescription("desc")
  );
  return Object.assign(base, overrides);
};

describe("EditUserCommandHandler", () => {
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

  it("fails when targetUserId is missing", async () => {
    const handler = new EditUserCommandHandler(repo);
    const cmd = new EditUser(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    );
    const result = await handler.execute(cmd);
    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(DomainException);
  });

  it("fails when user does not exist", async () => {
    const handler = new EditUserCommandHandler(repo);
    repo.getOneById.mockResolvedValue(null);
    const cmd = new EditUser(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      UserId.generateId().value
    );
    const result = await handler.execute(cmd);
    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.name ?? "").toContain("UserNotFound");
  });

  it("fails with DomainException when changing to a taken username", async () => {
    const handler = new EditUserCommandHandler(repo);
    const existing = await makeUser();
    repo.getOneById.mockResolvedValue(existing);
    repo.getOneByName.mockResolvedValue({
      id: { value: "other-user-id" },
    } as any);
    const cmd = new EditUser(
      "taken_name",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      existing.id.value
    );
    const result = await handler.execute(cmd);
    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(DomainException);
  });

  it("fails when new password provided but current password missing", async () => {
    const handler = new EditUserCommandHandler(repo);
    const existing = await makeUser();
    repo.getOneById.mockResolvedValue(existing);

    const cmd = new EditUser(
      undefined,
      undefined,
      undefined,
      "NewPass1!",
      "NewPass1!",
      undefined,
      undefined,
      undefined,
      undefined,
      existing.id.value
    );
    const result = await handler.execute(cmd);
    expect(result.isFailure).toBe(true);
    expect((result.error as Error).message).toMatch(
      /current password is required/i
    );
  });

  it("succeeds when editing simple fields without conflicts", async () => {
    const handler = new EditUserCommandHandler(repo);
    const existing = await makeUser();
    repo.getOneById.mockResolvedValue(existing);
    repo.getOneByName.mockResolvedValue(null);
    repo.getOneByEmail.mockResolvedValue(null);

    const cmd = new EditUser(
      undefined,
      "newmail@example.com",
      undefined,
      undefined,
      undefined,
      "New Name",
      "New desc",
      undefined,
      "DARK",
      existing.id.value
    );
    const result = await handler.execute(cmd);
    expect(result.isSuccess).toBe(true);
    expect(repo.edit).toHaveBeenCalledTimes(1);
  });
});
