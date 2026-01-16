import { GroupTestAPI } from "../../src/lib/groups/application/test/TrasnsferAdminTestBuilder";
import { GroupMother } from "../../src/lib/groups/domain/test/GroupMotherBuilder";

describe('Transferir el administrador de un grupo', () => {
  const api = new GroupTestAPI();

  it('debería fallar si un usuario que no es el admin actual intenta transferir el administrador', () => {
    const ADMIN_ID = "123e4567-e89b-42d3-a456-426614174123";
    const IMPOSTOR_ID = "123e4567-e89b-42d3-a456-426614174000";
    const NUEVO_ADMIN_ID = "123e4567-e89b-42d3-a456-426614174567";

    // GIVEN
    const group = GroupMother
      .aGroupWithAdminAndMember(ADMIN_ID, IMPOSTOR_ID)
      .withMember(NUEVO_ADMIN_ID)
      .build();

    api.given(group)
      // WHEN
      .whenAdminIsTransferred(IMPOSTOR_ID, NUEVO_ADMIN_ID)
      // THEN
      .thenItShouldFailWith("solo el admin actual puede transferir el rol de admin.");
  });
});

describe('Regla de Negocio: Transferencia a No-Miembros', () => {
  const api = new GroupTestAPI();

  it('debería fallar si se intenta transferir el mando a un usuario que no pertenece al grupo', () => {
    const ADMIN_ACTUAL = "123e4567-e89b-42d3-a456-426614174123";
    const NUEVO_ADMIN_FUEREÑO = "123e4567-e89b-42d3-a456-426614174567"; 

    // GIVEN:
    const group = GroupMother
      .aGroup()
      .withAdmin(ADMIN_ACTUAL)
      .build();

    api.given(group)
      // WHEN:
      .whenAdminIsTransferred(ADMIN_ACTUAL, NUEVO_ADMIN_FUEREÑO)
      // THEN:
      .thenItShouldFailWith("El nuevo admin debe ser un miembro del grupo.");
  });
});