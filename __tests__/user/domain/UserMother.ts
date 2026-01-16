import { User } from "../../../src/lib/user/domain/aggregate/User";
import { UserName } from "../../../src/lib/user/domain/valueObject/UserName";
import { UserEmail } from "../../../src/lib/user/domain/valueObject/UserEmail";
import { UserHashedPassword } from "../../../src/lib/user/domain/valueObject/UserHashedPassword";
import { UserType } from "../../../src/lib/user/domain/valueObject/UserType";
import { UserPlainName } from "../../../src/lib/user/domain/valueObject/UserPlainName";
import { UserDescription } from "../../../src/lib/user/domain/valueObject/UserDescription";
// Asumo que UserId se genera automáticamente o se pasa opcionalmente,
// pero para recrear un usuario existente necesitamos simular un ID.
import { UserId } from "../../../src/lib/user/domain/valueObject/UserId";

export class UserMother {
  private static VALID_BCRYPT_HASH = "$2b$" + "a".repeat(56);
  /**
   * Crea un usuario estándar válido para pruebas.
   */
  static createStandard(): User {
    // Nota: Ajusta el orden de los parámetros según el constructor real de tu clase User.
    // Basado en tus snippets, parece que usas Value Objects.
    return new User(
      new UserName("john_doe"),
      new UserEmail("john@example.com"),
      new UserHashedPassword(UserMother.VALID_BCRYPT_HASH),
      new UserType("STUDENT"),
      undefined, // avatarAssetId si es opcional
      undefined, // id si es opcional
      new UserPlainName("John Doe"),
      new UserDescription("Standard user for testing")
    );
  }

  /**
   * Crea un usuario con un nombre de usuario específico (útil para probar conflictos).
   */
  static createWithUsername(username: string): User {
    const user = this.createStandard();
    // Como los Value Objects suelen ser inmutables, idealmente crearíamos uno nuevo,
    // pero para mocks de retorno, podemos forzar la propiedad o crear una nueva instancia si User lo permite.
    // Aquí asumo una reconstrucción simple para el ejemplo:
    return new User(
      new UserName(username),
      user.email,
      user.hashedPassword,
      user.userType,
      user.avatarAssetId,
      user.id,
      user.name,
      user.description
    );
  }

  /**
   * Crea un usuario con un email específico.
   */
  static createWithEmail(email: string): User {
    const user = this.createStandard();
    return new User(
      user.userName,
      new UserEmail(email),
      user.hashedPassword,
      user.userType,
      user.avatarAssetId,
      user.id,
      user.name,
      user.description
    );
  }
}
