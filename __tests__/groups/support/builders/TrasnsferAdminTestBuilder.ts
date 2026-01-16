import { mock, MockProxy } from 'jest-mock-extended';
import { GroupRepository } from '../../../../src/lib/groups/domain/port/GroupRepository';
import { TransferGroupAdminCommandHandler } from '../../../../src/lib/groups/application/Handlers/commands/TransferGroupAdminCommandHandler';
import { TransferGroupAdminCommand } from '../../../../src/lib/groups/application/parameterObjects/TransferGroupAdminCommand';
import { Group } from '../../../../src/lib/groups/domain/entity/Group';
import { Optional } from 'src/lib/shared/Type Helpers/Optional';

export class TransferAdminTestBuilder {
    private repoMock: MockProxy<GroupRepository>;
    private handler: TransferGroupAdminCommandHandler;
    private lastResult: any;

    constructor() {
        this.repoMock = mock<GroupRepository>();
        this.handler = new TransferGroupAdminCommandHandler(this.repoMock);
    }

    public givenGroupExists(group: Group): this {
        this.repoMock.findById.mockResolvedValue(new Optional(group));
        return this;
    }

    public async whenTransferAdminIsExecuted(groupId: string, currentUserId: string, newAdminId: string): Promise<this> {
        const command = new TransferGroupAdminCommand(groupId, currentUserId, newAdminId);
        this.lastResult = await this.handler.execute(command);
        return this;
    }

    public thenShouldFailWith(expectedMessage: string): void {
        expect(this.lastResult.isLeft()).toBe(true);
        expect(this.lastResult.getLeft().message).toContain(expectedMessage);
    }

    public thenGroupShouldBeSaved(): void {
        expect(this.repoMock.save).toHaveBeenCalled();
    }
}