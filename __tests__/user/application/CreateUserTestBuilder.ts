import { CreateUserCommandHandler } from "../../../src/lib/user/application/Handlers/Commands/CreateUserCommandHandler";
import { CreateUser } from "../../../src/lib/user/application/Parameter Objects/CreateUser";
import { UserRepository } from "../../../src/lib/user/domain/port/UserRepository";
import { Result } from "../../../src/lib/shared/Type Helpers/result";
import { DomainException } from "../../../src/lib/shared/exceptions/domain.exception";
import { UserMother } from "../domain/UserMother"; // Asegúrate que la ruta al Mother sea correcta

export class CreateUserTestBuilder {
  private repo: jest.Mocked<UserRepository>;
  private handler: CreateUserCommandHandler;
  private lastResult: Result<any> | undefined;

  constructor() {
    // Inicializamos el mock del repositorio ocultando los detalles de jest.fn()
    this.repo = {
      getAll: jest.fn(),
      getOneById: jest.fn(),
      getOneByName: jest.fn(),
      getOneByEmail: jest.fn(),
      create: jest.fn(),
      edit: jest.fn(),
      delete: jest.fn(),
    };

    // Inicializamos el handler con el mock
    this.handler = new CreateUserCommandHandler(this.repo);
  }

  // --- GIVEN (Configuración del escenario) ---

  public givenUserDoesNotExist(): this {
    // Simulamos que no se encuentra nada en la BD
    this.repo.getOneById.mockResolvedValue(null);
    this.repo.getOneByName.mockResolvedValue(null);
    this.repo.getOneByEmail.mockResolvedValue(null);
    this.repo.create.mockResolvedValue(undefined); // Éxito al guardar
    return this;
  }

  public givenUsernameAlreadyExists(username: string): this {
    const existingUser = UserMother.createWithUsername(username);
    this.repo.getOneByName.mockResolvedValue(existingUser);
    // Para otros métodos devolvemos null para aislar el caso
    this.repo.getOneByEmail.mockResolvedValue(null);
    return this;
  }

  public givenEmailAlreadyExists(email: string): this {
    const existingUser = UserMother.createWithEmail(email);
    this.repo.getOneByEmail.mockResolvedValue(existingUser);
    // Para otros métodos devolvemos null
    this.repo.getOneByName.mockResolvedValue(null);
    return this;
  }

  // --- WHEN (Ejecución de la acción) ---

  public async whenUserIsCreated(
    username: string,
    email: string,
    pass: string,
    type: "STUDENT" | "TEACHER" = "STUDENT",
    name: string = "John Doe"
  ): Promise<this> {
    const command = new CreateUser(username, email, pass, type, name);
    this.lastResult = await this.handler.execute(command);
    return this;
  }

  // --- THEN (Verificaciones / Aserciones) ---

  public thenUserShouldBeCreatedSuccessfully(): void {
    if (!this.lastResult)
      throw new Error("No result found. Did you call 'when...'?");

    expect(this.lastResult.isSuccess).toBe(true);
    // Verificamos que se haya llamado al método guardar del repositorio
    expect(this.repo.create).toHaveBeenCalledTimes(1);
  }

  public thenShouldFailWithBusinessError(errorFragment: string): void {
    if (!this.lastResult)
      throw new Error("No result found. Did you call 'when...'?");

    expect(this.lastResult.isFailure).toBe(true);
    expect(this.lastResult.error).toBeInstanceOf(DomainException);

    // Verificamos que el mensaje de error contenga el fragmento esperado (ej: "username already exists")
    const errorMessage = (this.lastResult.error as Error).message;
    expect(errorMessage).toMatch(new RegExp(errorFragment, "i"));

    // Verificamos que NO se haya guardado nada
    expect(this.repo.create).not.toHaveBeenCalled();
  }
}
