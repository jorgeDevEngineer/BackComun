import { DeleteUserCommandHandler } from "../../../src/lib/user/application/Handlers/Commands/DeleteUserCommandHandler";
import { DeleteUser } from "../../../src/lib/user/application/Parameter Objects/DeleteUser";
import { UserRepository } from "../../../src/lib/user/domain/port/UserRepository";
import { DomainException } from "../../../src/lib/shared/exceptions/domain.exception";

describe("DeleteUserCommandHandler", () => {
  let repo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    repo = {
      getAll: jest.fn(),
      getOneById: jest.fn(),
      getOneByName: jest.fn(),
      getOneByEmail: jest.fn(),
      create: jest.fn(),
      edit: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    };
  });

  it("fails when targetUserId is missing", async () => {
    const handler = new DeleteUserCommandHandler(repo);
    const cmd = new DeleteUser(undefined);
    const result = await handler.execute(cmd);
    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(DomainException);
  });

  it("deletes when targetUserId is provided", async () => {
    const handler = new DeleteUserCommandHandler(repo);
    const cmd = new DeleteUser("123e4567-e89b-42d3-a456-426614174000");
    const result = await handler.execute(cmd);
    expect(result.isSuccess).toBe(true);
    expect(repo.delete).toHaveBeenCalledTimes(1);
  });
});
