import { CreateGroupTestBuilder } from '../../src/lib/groups/application/test/CreateGroupTestBuilder';
import { GroupMother } from 'src/lib/groups/domain/test/GroupMother';

describe('CreateGroupCommandHandler (Clean Test)', () => {
  
  it('debería crear un grupo exitosamente y persistirlo', async () => {
    const test = new CreateGroupTestBuilder();
    await test
      .whenCreateGroupIsExecuted(GroupMother.GROUP_NAME, GroupMother.ADMIN_ID)
      .then(() => {
          test.thenGroupShouldBeSaved();
          test.thenResponseShouldContainId();
      });
  });
});