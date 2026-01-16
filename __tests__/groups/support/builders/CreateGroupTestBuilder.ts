import { mock, MockProxy } from 'jest-mock-extended';
import { GroupRepository } from '../../../../src/lib/groups/domain/port/GroupRepository';
import { CreateGroupCommandHandler } from '../../../../src/lib/groups/application/Handlers/commands/CreateGroupCommandHandler';
import { CreateGroupCommand } from '../../../../src/lib/groups/application/parameterObjects/CreateGroupCommand';
import { CreateGroupResponseDto } from '../../../../src/lib/groups/application/dtos/GroupResponse.dto';
import { Group } from '../../../../src/lib/groups/domain/entity/Group';

export class CreateGroupTestBuilder {
    private repoMock: MockProxy<GroupRepository>;
    private handler: CreateGroupCommandHandler;
    private lastResponse?: CreateGroupResponseDto;

    constructor() {
        this.repoMock = mock<GroupRepository>();
        this.handler = new CreateGroupCommandHandler(this.repoMock);
    }

    public givenNoCollisions(): this {
        return this;
    }

    public async whenGroupIsCreated(name: string, adminId: string): Promise<this> {
        const command = new CreateGroupCommand(name, adminId);
        this.lastResponse = await this.handler.execute(command);
        return this;
    }

    public thenGroupShouldBeSavedInRepository(): void {
        expect(this.repoMock.save).toHaveBeenCalled();
        const savedGroup = this.repoMock.save.mock.calls[0][0] as Group;
        expect(savedGroup.name.value).toBe(this.lastResponse?.name);
    }

    public thenResponseShouldHaveValidData(expectedName: string, expectedAdminId: string): void {
        expect(this.lastResponse).toBeDefined();
        expect(this.lastResponse?.name).toBe(expectedName);
        expect(this.lastResponse?.adminId).toBe(expectedAdminId);
        expect(this.lastResponse?.memberCount).toBe(1); 
    }

    private capturedError: any;

    public async whenGroupIsCreatedWithInvalidData(name: string, adminId: string): Promise<this> {
        try {
            const command = new CreateGroupCommand(name, adminId);
            await this.handler.execute(command);
        } catch (error) {
            this.capturedError = error;
        }
        return this;
    }

    public thenItShouldFailDueToInvalidName(): void {
        expect(this.capturedError).toBeDefined();
    }
}