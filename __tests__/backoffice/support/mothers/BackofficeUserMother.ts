/**
 * Object Mother para crear usuarios de prueba del módulo backoffice.
 * Se usan objetos planos en lugar de instancias de User para evitar
 * problemas de imports con extensiones .js en los tests de Jest.
 */
export class BackofficeUserMother {
  private static VALID_UUID_ADMIN = "550e8400-e29b-41d4-a716-446655440000";
  private static VALID_UUID_STANDARD = "660e8400-e29b-41d4-a716-446655440001";
  private static VALID_UUID_BLOCKED = "770e8400-e29b-41d4-a716-446655440002";

  /**
   * Crea un usuario administrador válido para pruebas.
   * Devuelve un objeto con la estructura esperada por los use cases.
   */
  static createAdmin(): { isAdmin: boolean; id: { value: string } } {
    return {
      isAdmin: true,
      id: { value: BackofficeUserMother.VALID_UUID_ADMIN },
    };
  }

  /**
   * Crea un usuario estándar (no admin) válido para pruebas.
   */
  static createStandard(): { isAdmin: boolean; id: { value: string } } {
    return {
      isAdmin: false,
      id: { value: BackofficeUserMother.VALID_UUID_STANDARD },
    };
  }

  /**
   * Crea un usuario bloqueado para pruebas.
   */
  static createBlocked(): { isAdmin: boolean; id: { value: string }; status: string } {
    return {
      isAdmin: false,
      id: { value: BackofficeUserMother.VALID_UUID_BLOCKED },
      status: "Blocked",
    };
  }

  /**
   * Crea un usuario con un ID específico.
   */
  static createWithId(id: string, isAdmin: boolean = false): { isAdmin: boolean; id: { value: string } } {
    return {
      isAdmin,
      id: { value: id },
    };
  }

  /**
   * Retorna el UUID válido para el admin de pruebas.
   */
  static getAdminId(): string {
    return BackofficeUserMother.VALID_UUID_ADMIN;
  }

  /**
   * Retorna el UUID válido para el usuario estándar de pruebas.
   */
  static getStandardId(): string {
    return BackofficeUserMother.VALID_UUID_STANDARD;
  }

  /**
   * Retorna el UUID válido para el usuario bloqueado de pruebas.
   */
  static getBlockedId(): string {
    return BackofficeUserMother.VALID_UUID_BLOCKED;
  }
}
