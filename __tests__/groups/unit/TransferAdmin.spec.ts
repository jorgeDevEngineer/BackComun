import { TransferAdminTestBuilder } from "../support/builders/TrasnsferAdminTestBuilder";
import { GroupMother } from "../support/mothers/GroupMotherBuilder";

describe('Transferir el administrador de un grupo', () => {
  const api = new TransferAdminTestBuilder();

  it('debería fallar si un impostor intenta transferir la administración', async () => {
    const ADMIN_REAL = "123e4567-e89b-42d3-a456-426614174123";
    const IMPOSTOR = "123e4567-e89b-42d3-a456-426614174000";
    const NUEVO_ADMIN = "123e4567-e89b-42d3-a456-426614174236";

    const group = GroupMother.aGroupWithAdminAndMember(ADMIN_REAL, NUEVO_ADMIN).build();

    await api
        .givenGroupExists(group)
        .whenTransferAdminIsExecuted(group.id.value, IMPOSTOR, NUEVO_ADMIN);

    api.thenShouldFailWith("Solo el administrador del grupo puede transferir");
  });

  it('debería fallar si se intenta transferir el mando a un usuario que no pertenece al grupo', async () => {
    const ADMIN_ACTUAL = "123e4567-e89b-42d3-a456-426614174123";
    const NUEVO_ADMIN_FUEREÑO = "123e4567-e89b-42d3-a456-426614174567"; 

    const group = GroupMother.aGroup().withAdmin(ADMIN_ACTUAL).build();

    await api
      .givenGroupExists(group)
      .whenTransferAdminIsExecuted(group.id.value, ADMIN_ACTUAL, NUEVO_ADMIN_FUEREÑO);
      
    api.thenShouldFailWith("is not a member of group"); 
  });
});