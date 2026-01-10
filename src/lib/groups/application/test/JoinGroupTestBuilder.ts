import { mock, MockProxy } from 'jest-mock-extended';
import { GroupRepository } from 'src/lib/groups/domain/port/GroupRepository';
import { JoinGroupByInvitationCommandHandler } from '../Handlers/commands/JoinGroupByInvitationCommandHandler';
import { JoinGroupByInvitationCommand } from '../../application/parameterObjects/JoinGroupByInvitationCommand';
import { JoinGroupByInvitationResponseDto } from '../../application/dtos/GroupResponse.dto';
import { Either } from 'src/lib/shared/Type Helpers/Either';
import { DomainException } from 'src/lib/shared/exceptions/DomainException';
import { GroupMother } from 'src/lib/groups/domain/test/GroupMother';
import { Group } from 'src/lib/groups/domain/entity/Group';
import { Optional } from 'src/lib/shared/Type Helpers/Optional'; 

export class JoinGroupTestBuilder {
  private repositoryMock: MockProxy<GroupRepository>;
  private handler: JoinGroupByInvitationCommandHandler;
  private result: Either<DomainException, JoinGroupByInvitationResponseDto> | null = null;

  constructor() {
    this.repositoryMock = mock<GroupRepository>();
    this.repositoryMock.save.mockResolvedValue(undefined);
    this.handler = new JoinGroupByInvitationCommandHandler(this.repositoryMock);
  }

  // --- GIVEN ---

  public givenInvitationExists(token: string): this {
    const group = GroupMother.withActiveInvitation(token);
    
    this.repositoryMock.findByInvitationToken
        .calledWith(token)
        .mockResolvedValue( new Optional(group) ); 
        
    return this;
  }

  public givenInvitationExpired(token: string): this {
    const group = GroupMother.withExpiredInvitation(token);
    
    this.repositoryMock.findByInvitationToken
        .calledWith(token)
        .mockResolvedValue( new Optional(group) );
        
    return this;
  }

  public givenInvitationDoesNotExist(token: string): this {
    this.repositoryMock.findByInvitationToken
        .calledWith(token)
        .mockResolvedValue(new Optional(null)); 
        
    return this;
  }

  // --- WHEN (Acción) ---

  public async whenUserJoins(token: string, userId: string): Promise<this> {
    const command = new JoinGroupByInvitationCommand(token, userId);
    this.result = await this.handler.execute(command);
    return this;
  }

  // --- THEN (Verificaciones) ---

  public thenShouldJoinSuccessfully(): void {
    // 1. Verificamos que hay resultado
    expect(this.result).toBeDefined();
    
    // 2. Verificamos que sea RIGHT (Éxito)
    if (this.result!.isLeft()) {
        throw new Error(`Se esperaba éxito, pero falló con: ${this.result!.getLeft().message}`);
    }
    expect(this.result!.isRight()).toBe(true);
    expect(this.result!.getRight().joinedAs).toBe('member');
    
    // 3. Verificamos que se guardó el grupo actualizado
    expect(this.repositoryMock.save).toHaveBeenCalledTimes(1);
  }

  public thenShouldFailWith(errorMessageFragment: string): void {
    expect(this.result).toBeDefined();
    
    // 1. Verificamos que sea LEFT (Fallo)
    if (this.result!.isRight()) {
        throw new Error("Se esperaba un fallo, pero tuvo éxito");
    }
    expect(this.result!.isLeft()).toBe(true);
    
    // 2. Verificamos el mensaje de error
    expect(this.result!.getLeft().message).toContain(errorMessageFragment);
    
    // 3. Si falló, NO debió guardar nada en la BD
    expect(this.repositoryMock.save).not.toHaveBeenCalled();
  }
}