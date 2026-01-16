import { CreateUserCommandHandler } from "../../../src/lib/user/application/Handlers/Commands/CreateUserCommandHandler";
import { CreateUser } from "../../../src/lib/user/application/Parameter Objects/CreateUser";
import { UserRepository } from "../../../src/lib/user/domain/port/UserRepository";
import { Result } from "../../../src/lib/shared/Type Helpers/result";
import { DomainException } from "../../../src/lib/shared/exceptions/domain.exception";

describe("CreateUserCommandHandler", () => {
  let repo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    repo = {
      getAll: jest.fn(),
      getOneById: jest.fn(),
      getOneByName: jest.fn(),
      getOneByEmail: jest.fn(),
      create: jest.fn().mockResolvedValue(undefined),
      edit: jest.fn(),
      delete: jest.fn(),
    };
  });

  it("returns success when creating a valid user", async () => {
    repo.getOneById.mockResolvedValue(null);
    repo.getOneByName.mockResolvedValue(null);
    repo.getOneByEmail.mockResolvedValue(null);

    const handler = new CreateUserCommandHandler(repo);
    const cmd = new CreateUser(
      "john_doe",
      "john@example.com",
      "StrongPass1!",
      "STUDENT",
      "John Doe"
    );

    const result = await handler.execute(cmd);
    expect(result.isSuccess).toBe(true);
    expect(repo.create).toHaveBeenCalledTimes(1);
  });

  it("fails with DomainException when required fields are missing", async () => {
    const handler = new CreateUserCommandHandler(repo);
    const cmd = new CreateUser(
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

  it("fails with DomainException when username is already taken", async () => {
    const handler = new CreateUserCommandHandler(repo);
    // Simulate an existing user with same username
    repo.getOneById.mockResolvedValue(null);
    repo.getOneByName.mockResolvedValue({} as any); // non-null triggers duplicate
    repo.getOneByEmail.mockResolvedValue(null);

    const cmd = new CreateUser(
      "john_doe",
      "john2@example.com",
      "StrongPass1!",
      "STUDENT",
      "John Doe"
    );
    const result = await handler.execute(cmd);
    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(DomainException);
    expect((result.error as Error).message).toMatch(/username already exists/i);
  });

  it("fails with DomainException when email is already taken", async () => {
    const handler = new CreateUserCommandHandler(repo);
    repo.getOneById.mockResolvedValue(null);
    repo.getOneByName.mockResolvedValue(null);
    repo.getOneByEmail.mockResolvedValue({} as any);

    const cmd = new CreateUser(
      "john_doe3",
      "john@example.com",
      "StrongPass1!",
      "STUDENT",
      "John Doe"
    );
    const result = await handler.execute(cmd);
    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(DomainException);
    expect((result.error as Error).message).toMatch(/email already exists/i);
  });
});
