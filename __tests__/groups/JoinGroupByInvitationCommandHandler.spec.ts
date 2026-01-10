import { JoinGroupTestBuilder } from '../../src/lib/groups/application/test/JoinGroupTestBuilder';


describe('JoinGroupByInvitationCommandHandler', () => {
  const VALID_TOKEN = '22333d48c6ccfc1bfb0ed70e1439d484';
  const USER_ID = '123e4567-e89b-42d3-a456-426614174000';

  it('debería unirse al grupo si el token es válido', async () => {
    const test = new JoinGroupTestBuilder();

    await test
      .givenInvitationExists(VALID_TOKEN)
      .whenUserJoins(VALID_TOKEN, USER_ID)
      .then(() => {
        test.thenShouldJoinSuccessfully();
      });
  });

  it('debería fallar si el token no existe', async () => {
    const test = new JoinGroupTestBuilder();

    await test
      .givenInvitationDoesNotExist('token-falso')
      .whenUserJoins('token-falso', USER_ID)
      .then(() => {
        test.thenShouldFailWith('Invalid invitation token'); 
      });
  });

  it('debería fallar si la invitación ha expirado', async () => {
    const test = new JoinGroupTestBuilder();

    await test
      .givenInvitationExpired(VALID_TOKEN)
      .whenUserJoins(VALID_TOKEN, USER_ID)
      .then(() => {
        test.thenShouldFailWith('Invitation token has expired'); // Mensaje exacto de tu handler
      });
  });
});