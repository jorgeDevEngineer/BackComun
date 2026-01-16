import { UnblockUserUseCase, UnblockUserCommand, UnblockedUserDto } from "../../../src/lib/backoffice/application/UnblockUserUseCase";
import { UserRepository } from "../../../src/lib/backoffice/domain/port/UserRepository";
import { ITokenProvider } from "../../../src/lib/auth/application/providers/ITokenProvider";
import { BackofficeUserMother } from "../support/mothers/BackofficeUserMother";
import { InvalidTokenException } from "../../../src/lib/backoffice/domain/exceptions/InvalidTokenException";
import { UnauthorizedAdminException } from "../../../src/lib/backoffice/domain/exceptions/UnauthorizedAdminException";

describe("UnblockUserUseCase (Application Layer)", () => {
  let userRepositoryStub: jest.Mocked<UserRepository>;
  let tokenProviderStub: jest.Mocked<ITokenProvider>;
  let useCase: UnblockUserUseCase;

  const ADMIN_USER_ID = BackofficeUserMother.getAdminId();
  const TARGET_USER_ID = BackofficeUserMother.getBlockedId();
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

    useCase = new UnblockUserUseCase(userRepositoryStub, tokenProviderStub);
  });

  it("debería desbloquear a un usuario exitosamente cuando el admin está autenticado", async () => {
    // ARRANGE
    const adminUser = BackofficeUserMother.createAdmin();
    const unblockedUserResponse: UnblockedUserDto = {
      user: {
        id: TARGET_USER_ID,
        name: "Blocked User",
        email: "blocked@example.com",
        userType: "STUDENT",
        createdAt: new Date(),
        status: "Active",
      },
    };

    tokenProviderStub.validateToken.mockResolvedValue({ id: ADMIN_USER_ID });
    userRepositoryStub.getOneById.mockResolvedValue(adminUser as any);
    userRepositoryStub.UnblockUser.mockResolvedValue(unblockedUserResponse);

    const command: UnblockUserCommand = {
      auth: VALID_TOKEN,
      userId: TARGET_USER_ID,
    };

    // ACT
    const result = await useCase.execute(command);

    // ASSERT
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual(unblockedUserResponse);
    expect(result.getValue()?.user.status).toBe("Active");
    expect(userRepositoryStub.UnblockUser).toHaveBeenCalledTimes(1);
  });

  it("debería fallar con InvalidTokenException cuando el token es inválido", async () => {
    // ARRANGE
    tokenProviderStub.validateToken.mockResolvedValue(null);

    const command: UnblockUserCommand = {
      auth: "invalid-token",
      userId: TARGET_USER_ID,
    };

    // ACT
    const result = await useCase.execute(command);

    // ASSERT
    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(InvalidTokenException);
    expect(userRepositoryStub.UnblockUser).not.toHaveBeenCalled();
  });

  it("debería fallar con UnauthorizedAdminException cuando el usuario no es admin", async () => {
    // ARRANGE
    const standardUser = BackofficeUserMother.createStandard();

    tokenProviderStub.validateToken.mockResolvedValue({ id: standardUser.id.value });
    userRepositoryStub.getOneById.mockResolvedValue(standardUser as any);

    const command: UnblockUserCommand = {
      auth: VALID_TOKEN,
      userId: TARGET_USER_ID,
    };

    // ACT
    const result = await useCase.execute(command);

    // ASSERT
    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnauthorizedAdminException);
    expect(userRepositoryStub.UnblockUser).not.toHaveBeenCalled();
  });

  it("debería llamar a UnblockUser con el userId correcto", async () => {
    // ARRANGE
    const adminUser = BackofficeUserMother.createAdmin();
    const unblockedUserResponse: UnblockedUserDto = {
      user: {
        id: TARGET_USER_ID,
        name: "Blocked User",
        email: "blocked@example.com",
        userType: "STUDENT",
        createdAt: new Date(),
        status: "Active",
      },
    };

    tokenProviderStub.validateToken.mockResolvedValue({ id: ADMIN_USER_ID });
    userRepositoryStub.getOneById.mockResolvedValue(adminUser as any);
    userRepositoryStub.UnblockUser.mockResolvedValue(unblockedUserResponse);

    const command: UnblockUserCommand = {
      auth: VALID_TOKEN,
      userId: TARGET_USER_ID,
    };

    // ACT
    await useCase.execute(command);

    // ASSERT
    expect(userRepositoryStub.UnblockUser).toHaveBeenCalledWith(
      expect.objectContaining({ value: TARGET_USER_ID })
    );
  });
});
