import { JoinGroupTestBuilder } from "../../src/lib/groups/application/test/JoinGroupTestBuilder";
import { GroupMother } from "../../src/lib/groups/domain/test/GroupMotherBuilder";


describe('JoinGroupByInvitationCommandHandler (Aplicación)', () => {
    const api = new JoinGroupTestBuilder();
    const TOKEN_VALIDO = "22333d48c6ccfc1bfb0ed70e1439d484";
    const USER_ID = "e3af2274-fa08-406c-80d5-29c03fa87b07";

    it('debería fallar si el token de invitación ha expirado', async () => {
    const TOKEN = "f23b4611-f3c8-4fc9-94a5-3c29c0bba68f";
    const USER_ID = "e3af2274-fa08-406c-80d5-29c03fa87b07";

    // 1. GIVEN:
    const group = GroupMother.aGroup()
        .withExpiredInvitation(TOKEN) 
        .build();

    const later = new Date();
    later.setHours(later.getHours() + 5);
    await api
        .givenInvitationExists(group, TOKEN)
        .whenUserJoins(TOKEN, USER_ID, later); 

    // 3. THEN
    api.thenShouldFailWith("Invitation token has expired");
});

    it('debería unirse con éxito si el token es válido y no ha expirado', async () => {
        // GIVEN: 
        const group = GroupMother.aGroup()
            .withActiveInvitation(TOKEN_VALIDO)
            .build();

        await api
            .givenInvitationExists(group, TOKEN_VALIDO)
            .whenUserJoins(TOKEN_VALIDO, USER_ID);

        // THEN: 
        api.thenShouldJoinSuccessfully();
    });
});