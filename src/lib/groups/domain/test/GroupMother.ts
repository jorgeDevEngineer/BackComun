import { Group } from "../entity/Group";
import { GroupId } from "../valueObject/GroupId";
import { GroupName } from "../valueObject/GroupName";
import { GroupDescription } from "../valueObject/GroupDescription";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { GroupInvitationToken } from "../valueObject/GroupInvitationToken";
import { Optional } from "src/lib/shared/Type Helpers/Optional";

export class GroupMother {
  
  public static readonly GROUP_ID = '36ee22dd-3d5f-432a-866a-cc5420e155a6';
  public static readonly ADMIN_ID = '123e4567-e89b-42d3-a456-426614174123';
  public static readonly GROUP_NAME = 'Grupo de Estudio DDD';

  public static random(): Group {
    return Group.create(
      GroupId.of(this.GROUP_ID),
      GroupName.of(this.GROUP_NAME),
      GroupDescription.of('Descripción por defecto'),
      new UserId(this.ADMIN_ID),
      new Date()
    );
  }

  public static withActiveInvitation(tokenStr: string): Group {
    const group = this.random();
    
    const token = GroupInvitationToken.create(tokenStr, new Date(Date.now() + 86400000));

    Object.defineProperty(group, 'invitationToken', {
      value: new Optional(token),
      writable: true
    });
    
    return group;
  }

public static withExpiredInvitation(tokenStr: string): Group {
    const group = this.random();
    const token = GroupInvitationToken.create(tokenStr, new Date(Date.now() + 100000)); 
    Object.defineProperty(token, 'expiresAt', {
      value: new Date(Date.now() - 86400000), 
      writable: true 
    });
    (token as any).isExpired = () => true;
    Object.defineProperty(group, 'invitationToken', {
      value: new Optional(token),
      writable: true
    });

    return group;
  }
}