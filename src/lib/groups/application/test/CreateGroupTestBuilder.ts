import { mock, MockProxy } from 'jest-mock-extended';
import { GroupRepository } from 'src/lib/groups/domain/port/GroupRepository';
import { CreateGroupCommandHandler } from '../Handlers/commands/CreateGroupCommandHandler';
import { CreateGroupCommand } from '../parameterObjects/CreateGroupCommand';
import { CreateGroupResponseDto } from '../dtos/GroupResponse.dto';
import { Group } from 'src/lib/groups/domain/entity/Group';

export class CreateGroupTestBuilder {
  private repositoryMock: MockProxy<GroupRepository>;
  private handler: CreateGroupCommandHandler;
  private response: CreateGroupResponseDto | null = null;
  private error: Error | null = null;

  constructor() {
    this.repositoryMock = mock<GroupRepository>();
    this.handler = new CreateGroupCommandHandler(this.repositoryMock);
  }
  
  public givenRepositoryFails(): this {
    this.repositoryMock.save.mockRejectedValue(new Error('DB Error'));
    return this;
  }

  public async whenCreateGroupIsExecuted(name: string, userId: string): Promise<this> {
    const command = new CreateGroupCommand(name, userId);
    try {
      this.response = await this.handler.execute(command);
    } catch (e) {
      console.log('ERROR EN EL HANDLER:', e); 
      this.error = e as Error;
    }
    return this;
  }

  public thenGroupShouldBeSaved(): void {
    expect(this.repositoryMock.save).toHaveBeenCalledTimes(1);
    expect(this.repositoryMock.save).toHaveBeenCalledWith(expect.any(Group));
  }

  public thenResponseShouldContainId(): void {
    expect(this.response).toBeDefined();
    expect(this.response?.id).toBeDefined();
    expect(this.error).toBeNull();
  }
  
  public thenErrorShouldBeThrown(message: string): void {
      expect(this.error).toBeDefined();
      expect(this.error?.message).toBe(message);
  }
}