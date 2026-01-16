import { BlockUserUseCase, BlockUserCommand, BlockedUserDto } from "../../../src/lib/backoffice/application/BlockUserUseCase";
import { UserRepository } from "../../../src/lib/backoffice/domain/port/UserRepository";
import { ITokenProvider } from "../../../src/lib/auth/application/providers/ITokenProvider";
import { BackofficeUserMother } from "../support/mothers/BackofficeUserMother";
import { InvalidTokenException } from "../../../src/lib/backoffice/domain/exceptions/InvalidTokenException";
import { UnauthorizedAdminException } from "../../../src/lib/backoffice/domain/exceptions/UnauthorizedAdminException";

describe("BlockUserUseCase (Application Layer)", () => {
  let userRepositoryStub: jest.Mocked<UserRepository>;
  let tokenProviderStub: jest.Mocked<ITokenProvider>;
  let useCase: BlockUserUseCase;

  const ADMIN_USER_ID = BackofficeUserMother.getAdminId();
  const TARGET_USER_ID = BackofficeUserMother.getStandardId();
  const VALID_TOKEN = "valid-jwt-token";

  beforeEach(() => {
    // ARRANGE - Crear stubs de repositorio y token provider
    userRepositoryStub = {
      searchUsers: jest.fn(),
      deleteUser: jest.fn(),
      blockUser: jest.fn(),
      UnblockUser: jest.fn(),
      GiveAdminRole: jest.fn(),
      RemoveAdminRole: jest.fn(),
      getOneById: jest.fn(),
      getEmailNoadmin: jest.fn(),
      getEmailAdmin: jest.fn(),
    };

    tokenProviderStub = {
      validateToken: jest.fn(),
      generateToken: jest.fn(),
      revokeToken: jest.fn(),
      getPayloadFromAuthHeader: jest.fn(),
      getUserIdFromAuthHeader: jest.fn(),
    };

    useCase = new BlockUserUseCase(userRepositoryStub, tokenProviderStub);
  });

  it("debería bloquear a un usuario exitosamente cuando el admin está autenticado", async () => {
    // ARRANGE
    const adminUser = BackofficeUserMother.createAdmin();
    const blockedUserResponse: BlockedUserDto = {
      user: {
        id: TARGET_USER_ID,
        name: "John Doe",
        email: "john@example.com",
        userType: "STUDENT",
        createdAt: new Date(),
        status: "Blocked",
      },
    };

    tokenProviderStub.validateToken.mockResolvedValue({ id: ADMIN_USER_ID });
    userRepositoryStub.getOneById.mockResolvedValue(adminUser as any);
    userRepositoryStub.blockUser.mockResolvedValue(blockedUserResponse);

    const command: BlockUserCommand = {
      auth: VALID_TOKEN,
      userId: TARGET_USER_ID,
    };

    // ACT
    const result = await useCase.execute(command);

    // ASSERT
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual(blockedUserResponse);
    expect(userRepositoryStub.blockUser).toHaveBeenCalledTimes(1);
  });

  it("debería fallar con InvalidTokenException cuando el token es inválido", async () => {
    // ARRANGE
    tokenProviderStub.validateToken.mockResolvedValue(null);

    const command: BlockUserCommand = {
      auth: "invalid-token",
      userId: TARGET_USER_ID,
    };

    // ACT
    const result = await useCase.execute(command);

    // ASSERT
    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(InvalidTokenException);
    expect(userRepositoryStub.blockUser).not.toHaveBeenCalled();
  });

  it("debería fallar con UnauthorizedAdminException cuando el usuario no es admin", async () => {
    // ARRANGE
    const standardUser = BackofficeUserMother.createStandard();

    tokenProviderStub.validateToken.mockResolvedValue({ id: TARGET_USER_ID });
    userRepositoryStub.getOneById.mockResolvedValue(standardUser as any);

    const command: BlockUserCommand = {
      auth: VALID_TOKEN,
      userId: TARGET_USER_ID,
    };

    // ACT
    const result = await useCase.execute(command);

    // ASSERT
    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnauthorizedAdminException);
    expect(userRepositoryStub.blockUser).not.toHaveBeenCalled();
  });

  it("debería llamar a blockUser con el userId correcto", async () => {
    // ARRANGE
    const adminUser = BackofficeUserMother.createAdmin();
    const blockedUserResponse: BlockedUserDto = {
      user: {
        id: TARGET_USER_ID,
        name: "John Doe",
        email: "john@example.com",
        userType: "STUDENT",
        createdAt: new Date(),
        status: "Blocked",
      },
    };

    tokenProviderStub.validateToken.mockResolvedValue({ id: ADMIN_USER_ID });
    userRepositoryStub.getOneById.mockResolvedValue(adminUser as any);
    userRepositoryStub.blockUser.mockResolvedValue(blockedUserResponse);

    const command: BlockUserCommand = {
      auth: VALID_TOKEN,
      userId: TARGET_USER_ID,
    };

    // ACT
    await useCase.execute(command);

    // ASSERT
    expect(userRepositoryStub.blockUser).toHaveBeenCalledWith(
      expect.objectContaining({ value: TARGET_USER_ID })
    );
  });
});
