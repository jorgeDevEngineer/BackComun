import { LeaveGroupTestAPI } from "../../src/lib/groups/application/test/LeaveGroupTestBuilder";
import { GroupMother } from "../../src/lib/groups/domain/test/GroupMotherBuilder";

describe('LeaveGroupCommandHandler Clean Test', () => {
    const api = new LeaveGroupTestAPI();

    it('debería prohibir que el administrador abandone el grupo sin transferir la administracion', async () => {
        const ADMIN_ID = "e3af2274-fa08-406c-80d5-29c03fa87b07";
        const GROUP_ID = "48d96506-60f7-4051-bf71-7378ac680963";
        // GIVEN: 
        const group = GroupMother
            .aGroup()
            .withAdmin(ADMIN_ID)
            .build();

        await api
            .givenGroupExists(group)
            // WHEN:
            .whenUserTriesToLeave(GROUP_ID, ADMIN_ID);

        // THEN:
        api.thenShouldFailWith("El administrador no puede abandonar el grupo, debe transferir la administración");
        api.thenRepositoryShouldNotBeSaved();
    });
});