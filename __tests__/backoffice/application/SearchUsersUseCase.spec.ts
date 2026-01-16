import { SearchUsersUseCase, SearchUsersCommand, SearchParamsDto, SearchResultDto } from "../../../src/lib/backoffice/application/SearchUsersUseCase";
import { UserRepository } from "../../../src/lib/backoffice/domain/port/UserRepository";
import { ITokenProvider } from "../../../src/lib/auth/application/providers/ITokenProvider";
import { BackofficeUserMother } from "../support/mothers/BackofficeUserMother";
import { InvalidTokenException } from "../../../src/lib/backoffice/domain/exceptions/InvalidTokenException";
import { UnauthorizedAdminException } from "../../../src/lib/backoffice/domain/exceptions/UnauthorizedAdminException";

const crearMockResultadosBusqueda = (count: number = 2): SearchResultDto => ({
  data: Array.from({ length: count }, (_, i) => ({
    id: `user-${i + 1}`,
    name: `Usuario ${i + 1}`,
    email: `usuario${i + 1}@example.com`,
    userType: i % 2 === 0 ? "STUDENT" : "TEACHER",
    createdAt: new Date("2024-01-01"),
    status: "Active",
  })),
  pagination: {
    page: 1,
    limit: 10,
    totalCount: count,
    totalPages: Math.ceil(count / 10) || 1,
  },
});

describe("SearchUsersUseCase (Application Layer)", () => {
  let userRepositoryStub: jest.Mocked<UserRepository>;
  let tokenProviderStub: jest.Mocked<ITokenProvider>;
  let useCase: SearchUsersUseCase;

  const ADMIN_USER_ID = BackofficeUserMother.getAdminId();
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

    useCase = new SearchUsersUseCase(userRepositoryStub, tokenProviderStub);
  });

  it("debería retornar usuarios que coincidan con la consulta de búsqueda", async () => {
    // ARRANGE
    const adminUser = BackofficeUserMother.createAdmin();
    const searchParams: SearchParamsDto = {
      q: "john",
      order: "desc",
    };
    const searchResult = crearMockResultadosBusqueda(2);

    tokenProviderStub.validateToken.mockResolvedValue({ id: ADMIN_USER_ID });
    userRepositoryStub.getOneById.mockResolvedValue(adminUser as any);
    userRepositoryStub.searchUsers.mockResolvedValue(searchResult);

    const command: SearchUsersCommand = {
      auth: VALID_TOKEN,
      params: searchParams,
    };

    // ACT
    const result = await useCase.execute(command);

    // ASSERT
    expect(result.isSuccess).toBe(true);
    const resultValue = result.getValue();
    expect(resultValue).not.toBeNull();
    expect(resultValue!.data).toHaveLength(2);
    expect(resultValue!.pagination.totalCount).toBe(2);
    expect(userRepositoryStub.searchUsers).toHaveBeenCalledWith(searchParams);
  });

  it("debería fallar con InvalidTokenException cuando el token es inválido", async () => {
    // ARRANGE
    tokenProviderStub.validateToken.mockResolvedValue(null);

    const command: SearchUsersCommand = {
      auth: "invalid-token",
      params: { order: "desc" },
    };

    // ACT
    const result = await useCase.execute(command);

    // ASSERT
    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(InvalidTokenException);
    expect(userRepositoryStub.searchUsers).not.toHaveBeenCalled();
  });

  it("debería fallar con UnauthorizedAdminException cuando el usuario no es admin", async () => {
    // ARRANGE
    const standardUser = BackofficeUserMother.createStandard();

    tokenProviderStub.validateToken.mockResolvedValue({ id: standardUser.id.value });
    userRepositoryStub.getOneById.mockResolvedValue(standardUser as any);

    const command: SearchUsersCommand = {
      auth: VALID_TOKEN,
      params: { order: "desc" },
    };

    // ACT
    const result = await useCase.execute(command);

    // ASSERT
    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnauthorizedAdminException);
    expect(userRepositoryStub.searchUsers).not.toHaveBeenCalled();
  });

  it("debería retornar resultados paginados correctamente", async () => {
    // ARRANGE
    const adminUser = BackofficeUserMother.createAdmin();
    const searchParams: SearchParamsDto = {
      limit: 5,
      page: 2,
      order: "desc",
    };
    const searchResult: SearchResultDto = {
      ...crearMockResultadosBusqueda(5),
      pagination: {
        page: 2,
        limit: 5,
        totalCount: 15,
        totalPages: 3,
      },
    };

    tokenProviderStub.validateToken.mockResolvedValue({ id: ADMIN_USER_ID });
    userRepositoryStub.getOneById.mockResolvedValue(adminUser as any);
    userRepositoryStub.searchUsers.mockResolvedValue(searchResult);

    const command: SearchUsersCommand = {
      auth: VALID_TOKEN,
      params: searchParams,
    };

    // ACT
    const result = await useCase.execute(command);

    // ASSERT
    expect(result.isSuccess).toBe(true);
    const resultValue = result.getValue();
    expect(resultValue!.pagination.page).toBe(2);
    expect(resultValue!.pagination.limit).toBe(5);
    expect(resultValue!.pagination.totalPages).toBe(3);
  });

  it("debería retornar una lista vacía cuando no hay usuarios que coincidan con la consulta de búsqueda", async () => {
    // ARRANGE
    const adminUser = BackofficeUserMother.createAdmin();
    const searchParams: SearchParamsDto = {
      q: "nonexistent-user-xyz",
      order: "desc",
    };
    const emptyResult = crearMockResultadosBusqueda(0);

    tokenProviderStub.validateToken.mockResolvedValue({ id: ADMIN_USER_ID });
    userRepositoryStub.getOneById.mockResolvedValue(adminUser as any);
    userRepositoryStub.searchUsers.mockResolvedValue(emptyResult);

    const command: SearchUsersCommand = {
      auth: VALID_TOKEN,
      params: searchParams,
    };

    // ACT
    const result = await useCase.execute(command);

    // ASSERT
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()!.data).toHaveLength(0);
    expect(result.getValue()!.pagination.totalCount).toBe(0);
  });

  it("debería soportar ordenamiento por diferentes campos", async () => {
    // ARRANGE
    const adminUser = BackofficeUserMother.createAdmin();
    const searchParams: SearchParamsDto = {
      orderBy: "createdAt",
      order: "asc",
    };
    const searchResult = crearMockResultadosBusqueda(2);

    tokenProviderStub.validateToken.mockResolvedValue({ id: ADMIN_USER_ID });
    userRepositoryStub.getOneById.mockResolvedValue(adminUser as any);
    userRepositoryStub.searchUsers.mockResolvedValue(searchResult);

    const command: SearchUsersCommand = {
      auth: VALID_TOKEN,
      params: searchParams,
    };

    // ACT
    const result = await useCase.execute(command);

    // ASSERT
    expect(result.isSuccess).toBe(true);
    expect(userRepositoryStub.searchUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: "createdAt",
        order: "asc",
      })
    );
  });
});
