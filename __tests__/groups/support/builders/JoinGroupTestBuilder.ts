import { mock, MockProxy } from 'jest-mock-extended';
import { GroupRepository } from '../../../../src/lib/groups/domain/port/GroupRepository';
import { JoinGroupByInvitationCommandHandler } from '../../../../src/lib/groups/application/Handlers/commands/JoinGroupByInvitationCommandHandler';
import { JoinGroupByInvitationCommand } from '../../../../src/lib/groups/application/parameterObjects/JoinGroupByInvitationCommand';
import { Group } from '../../../../src/lib/groups/domain/entity/Group';
import { Optional } from 'src/lib/shared/Type Helpers/Optional';

export class JoinGroupTestBuilder {
    private repoMock: MockProxy<GroupRepository>;
    private handler: JoinGroupByInvitationCommandHandler;
    private lastResult: any;

    constructor() {
        this.repoMock = mock<GroupRepository>();
        this.handler = new JoinGroupByInvitationCommandHandler(this.repoMock);
    }

    public givenInvitationExists(group: Group, token: string): this {
        this.repoMock.findByInvitationToken.calledWith(token)
            .mockResolvedValue(new Optional(group));
        return this;
    }

   public async whenUserJoins(token: string, userId: string, now?: Date): Promise<this> {
    const command = new JoinGroupByInvitationCommand(token, userId, now);
    this.lastResult = await this.handler.execute(command);
    return this;
}

    public thenShouldFailWith(expectedMessage: string): void {
        expect(this.lastResult.isLeft()).toBe(true);
        expect(this.lastResult.getLeft().message).toContain(expectedMessage);
    }

    public thenShouldJoinSuccessfully(): void {
        expect(this.lastResult.isRight()).toBe(true);
        expect(this.repoMock.save).toHaveBeenCalled();
    }
}