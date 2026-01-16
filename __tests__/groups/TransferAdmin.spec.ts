import { TransferAdminTestBuilder } from "../../src/lib/groups/application/test/TrasnsferAdminTestBuilder";
import { GroupMother } from "../../src/lib/groups/domain/test/GroupMotherBuilder";

describe('Transferir el administrador de un grupo', () => {
  const api = new TransferAdminTestBuilder();

  it('debería fallar si un impostor intenta transferir la administración', async () => {
    const ADMIN_REAL = "123e4567-e89b-42d3-a456-426614174123";
    const IMPOSTOR = "123e4567-e89b-42d3-a456-426614174000";
    const NUEVO_ADMIN = "123e4567-e89b-42d3-a456-426614174236";

    const group = GroupMother.aGroupWithAdminAndMember(ADMIN_REAL, NUEVO_ADMIN).build();

    // 1. Arrange & Act
    await api
        .givenGroupExists(group)
        .whenTransferAdminIsExecuted(group.id.value, IMPOSTOR, NUEVO_ADMIN);

    // 2. Assert (Ahora api ya tiene el resultado guardado)
    api.thenShouldFailWith("Solo el administrador del grupo puede transferir");
  });

  it('debería fallar si se intenta transferir el mando a un usuario que no pertenece al grupo', async () => {
    const ADMIN_ACTUAL = "123e4567-e89b-42d3-a456-426614174123";
    const NUEVO_ADMIN_FUEREÑO = "123e4567-e89b-42d3-a456-426614174567"; 

    const group = GroupMother.aGroup().withAdmin(ADMIN_ACTUAL).build();

    // Importante: usar await aquí
    await api
      .givenGroupExists(group)
      .whenTransferAdminIsExecuted(group.id.value, ADMIN_ACTUAL, NUEVO_ADMIN_FUEREÑO);
      
    api.thenShouldFailWith("is not a member of group"); 
    // Nota: El mensaje debe coincidir con el error 'UserNotMemberOfGroupError' de tu Handler
  });
});