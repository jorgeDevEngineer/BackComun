import { RemoveAdminRoleUseCase, RemoveAdminCommand, RemovedAdminRoleDto } from "../../../src/lib/backoffice/application/RemoveAdminUseCase";
import { UserRepository } from "../../../src/lib/backoffice/domain/port/UserRepository";
import { ITokenProvider } from "../../../src/lib/auth/application/providers/ITokenProvider";
import { BackofficeUserMother } from "../support/mothers/BackofficeUserMother";
import { InvalidTokenException } from "../../../src/lib/backoffice/domain/exceptions/InvalidTokenException";
import { UnauthorizedAdminException } from "../../../src/lib/backoffice/domain/exceptions/UnauthorizedAdminException";

describe("RemoveAdminRoleUseCase (Application Layer)", () => {
  let userRepositoryStub: jest.Mocked<UserRepository>;
  let tokenProviderStub: jest.Mocked<ITokenProvider>;
  let useCase: RemoveAdminRoleUseCase;

  const ADMIN_USER_ID = BackofficeUserMother.getAdminId();
  const TARGET_USER_ID = "880e8400-e29b-41d4-a716-446655440003";
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

    useCase = new RemoveAdminRoleUseCase(userRepositoryStub, tokenProviderStub);
  });

  it("debería eliminar el rol de admin a un usuario exitosamente cuando el admin está autenticado", async () => {
    // ARRANGE
    const adminUser = BackofficeUserMother.createAdmin();
    const removeAdminResponse: RemovedAdminRoleDto = {
      user: {
        id: TARGET_USER_ID,
        name: "Former Admin",
        email: "formeradmin@example.com",
        userType: "TEACHER",
        createdAt: new Date(),
        status: "Active",
        isAdmin: false,
      },
    };

    tokenProviderStub.validateToken.mockResolvedValue({ id: ADMIN_USER_ID });
    userRepositoryStub.getOneById.mockResolvedValue(adminUser as any);
    userRepositoryStub.RemoveAdminRole.mockResolvedValue(removeAdminResponse);

    const command: RemoveAdminCommand = {
      auth: VALID_TOKEN,
      userId: TARGET_USER_ID,
    };

    // ACT
    const result = await useCase.execute(command);

    // ASSERT
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual(removeAdminResponse);
    expect(result.getValue()?.user.isAdmin).toBe(false);
    expect(userRepositoryStub.RemoveAdminRole).toHaveBeenCalledTimes(1);
  });

  it("debería fallar con InvalidTokenException cuando el token es inválido", async () => {
    // ARRANGE
    tokenProviderStub.validateToken.mockResolvedValue(null);

    const command: RemoveAdminCommand = {
      auth: "invalid-token",
      userId: TARGET_USER_ID,
    };

    // ACT
    const result = await useCase.execute(command);

    // ASSERT
    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(InvalidTokenException);
    expect(userRepositoryStub.RemoveAdminRole).not.toHaveBeenCalled();
  });

  it("debería fallar con UnauthorizedAdminException cuando el usuario no es admin", async () => {
    // ARRANGE
    const standardUser = BackofficeUserMother.createStandard();

    tokenProviderStub.validateToken.mockResolvedValue({ id: standardUser.id.value });
    userRepositoryStub.getOneById.mockResolvedValue(standardUser as any);

    const command: RemoveAdminCommand = {
      auth: VALID_TOKEN,
      userId: TARGET_USER_ID,
    };

    // ACT
    const result = await useCase.execute(command);

    // ASSERT
    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnauthorizedAdminException);
    expect(userRepositoryStub.RemoveAdminRole).not.toHaveBeenCalled();
  });

  it("debería llamar a RemoveAdminRole con el userId correcto", async () => {
    // ARRANGE
    const adminUser = BackofficeUserMother.createAdmin();
    const removeAdminResponse: RemovedAdminRoleDto = {
      user: {
        id: TARGET_USER_ID,
        name: "Former Admin",
        email: "formeradmin@example.com",
        userType: "TEACHER",
        createdAt: new Date(),
        status: "Active",
        isAdmin: false,
      },
    };

    tokenProviderStub.validateToken.mockResolvedValue({ id: ADMIN_USER_ID });
    userRepositoryStub.getOneById.mockResolvedValue(adminUser as any);
    userRepositoryStub.RemoveAdminRole.mockResolvedValue(removeAdminResponse);

    const command: RemoveAdminCommand = {
      auth: VALID_TOKEN,
      userId: TARGET_USER_ID,
    };

    // ACT
    await useCase.execute(command);

    // ASSERT
    expect(userRepositoryStub.RemoveAdminRole).toHaveBeenCalledWith(
      expect.objectContaining({ value: TARGET_USER_ID })
    );
  });

  it("debería ser idempotente - eliminar el rol de admin de un usuario que no es admin debe completar exitosamente", async () => {
    // ARRANGE
    const adminUser = BackofficeUserMother.createAdmin();
    const standardUserId = BackofficeUserMother.getStandardId();
    const removeAdminResponse: RemovedAdminRoleDto = {
      user: {
        id: standardUserId,
        name: "Standard User",
        email: "standard@example.com",
        userType: "STUDENT",
        createdAt: new Date(),
        status: "Active",
        isAdmin: false,
      },
    };

    tokenProviderStub.validateToken.mockResolvedValue({ id: ADMIN_USER_ID });
    userRepositoryStub.getOneById.mockResolvedValue(adminUser as any);
    userRepositoryStub.RemoveAdminRole.mockResolvedValue(removeAdminResponse);

    const command: RemoveAdminCommand = {
      auth: VALID_TOKEN,
      userId: standardUserId,
    };

    // ACT
    const result = await useCase.execute(command);

    // ASSERT
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()?.user.isAdmin).toBe(false);
  });
});
