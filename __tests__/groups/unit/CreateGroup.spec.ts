import { GroupMother } from "../support/mothers/GroupMotherBuilder";
import { CreateGroupTestBuilder } from "../support/builders/CreateGroupTestBuilder";


describe('CreateGroupCommandHandler (Aplicación)', () => {
    const api = new CreateGroupTestBuilder();

    it('debería crear un grupo exitosamente con el usuario actual como administrador', async () => {
        const NOMBRE_GRUPO = "Desarrollo de soft";
        const ADMIN_ID = "e3af2274-fa08-406c-80d5-29c03fa87b07";

        await api
            .givenNoCollisions()
            .whenGroupIsCreated(NOMBRE_GRUPO, ADMIN_ID);

        api.thenResponseShouldHaveValidData(NOMBRE_GRUPO, ADMIN_ID);
        
        api.thenGroupShouldBeSavedInRepository();
    });

    it('debería fallar al intentar crear un grupo con un nombre vacío', async () => {
    const ADMIN_ID = "e3af2274-fa08-406c-80d5-29c03fa87b07";

    await api.whenGroupIsCreatedWithInvalidData("", ADMIN_ID);

    api.thenItShouldFailDueToInvalidName();
});
});