import { mock, MockProxy } from 'jest-mock-extended';
import { GroupRepository } from '../../domain/port/GroupRepository';
import { LeaveGroupCommandHandler } from '../Handlers/commands/LeaveGroupCommandHandler';
import { LeaveGroupCommand } from '../../application/parameterObjects/LeaveGroupCommand';
import { Group } from '../../domain/entity/Group';
import { Optional } from 'src/lib/shared/Type Helpers/Optional';

export class LeaveGroupTestAPI {
    private repoMock: MockProxy<GroupRepository>;
    private handler: LeaveGroupCommandHandler;
    private lastResult: any;

    constructor() {
        this.repoMock = mock<GroupRepository>();
        this.handler = new LeaveGroupCommandHandler(this.repoMock);
    }

    // GIVEN:
    public givenGroupExists(group: Group): this {
        this.repoMock.findById.mockResolvedValue(new Optional(group));
        return this;
    }

    // WHEN: 
    public async whenUserTriesToLeave(groupId: string, userId: string): Promise<this> {
        const command = new LeaveGroupCommand(groupId, userId);
        this.lastResult = await this.handler.execute(command);
        return this;
    }

    // THEN: 
    public thenShouldFailWith(expectedMessage: string): void {
        expect(this.lastResult.isLeft()).toBe(true);
        expect(this.lastResult.getLeft().message).toContain(expectedMessage);
    }

    public thenRepositoryShouldNotBeSaved(): void {
        expect(this.repoMock.save).not.toHaveBeenCalled();
    }
}