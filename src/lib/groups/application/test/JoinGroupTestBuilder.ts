import { mock, MockProxy } from 'jest-mock-extended';
import { GroupRepository } from '../../domain/port/GroupRepository';
import { JoinGroupByInvitationCommandHandler } from '../Handlers/commands/JoinGroupByInvitationCommandHandler';
import { JoinGroupByInvitationCommand } from '../../application/parameterObjects/JoinGroupByInvitationCommand';
import { Group } from '../../domain/entity/Group';
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