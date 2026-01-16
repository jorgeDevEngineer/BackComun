import { mock, MockProxy } from 'jest-mock-extended';
import { GroupRepository } from '../../domain/port/GroupRepository';
import { TransferGroupAdminCommandHandler } from '../Handlers/commands/TransferGroupAdminCommandHandler';
import { TransferGroupAdminCommand } from '../../application/parameterObjects/TransferGroupAdminCommand';
import { Group } from '../../domain/entity/Group';
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
        // Configuramos el repo para que cuando busquen el grupo, devuelva el que creamos con el Mother
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
        // Accedemos al mensaje del error dentro del Either (Left)
        expect(this.lastResult.getLeft().message).toContain(expectedMessage);
    }

    public thenGroupShouldBeSaved(): void {
        expect(this.repoMock.save).toHaveBeenCalled();
    }
}