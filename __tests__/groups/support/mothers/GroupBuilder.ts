import { Group } from "../../../../src/lib/groups/domain/entity/Group";
import { GroupId } from "../../../../src/lib/groups/domain/valueObject/GroupId";
import { GroupName } from "../../../../src/lib/groups/domain/valueObject/GroupName";
import { GroupDescription } from "../../../../src/lib/groups/domain/valueObject/GroupDescription";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { Optional } from "src/lib/shared/Type Helpers/Optional";
import { GroupInvitationToken } from "../../../../src/lib/groups/domain/valueObject/GroupInvitationToken";

export class GroupBuilder {
  private id: GroupId = GroupId.create("123e4567-e89b-42d3-a456-426614174123");
  private name: GroupName = GroupName.create("Grupo Default");
  private description: Optional<GroupDescription> = new Optional(GroupDescription.create("Descripcion"));
  private adminId: UserId = new UserId("123e4567-e89b-42d3-a456-426614174123");
  private members: UserId[] = [];
  private invitationToken: Optional<GroupInvitationToken> = new Optional(null);

  public withAdmin(adminId: string): this {
    this.adminId = new UserId(adminId);
    return this;
  }

  public withMember(userId: string): this {
    this.members.push(new UserId(userId));
    return this;
  }

  public withExpiredInvitation(tokenStr: string): this {
    const future = new Date();
    future.setHours(future.getHours() + 1);
    
    this.invitationToken = new Optional(
        GroupInvitationToken.create(tokenStr, future)
    );
    return this;
}

    public withActiveInvitation(tokenStr: string): this {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        this.invitationToken = new Optional(
            GroupInvitationToken.create(tokenStr, tomorrow)
        );
        return this;
    }

    public build(): Group {
    const now = new Date();
    const group = Group.create(
        this.id,          
        this.name,       
        this.description.getValue(), 
        this.adminId,     
        now            
    );
    if (this.invitationToken.hasValue()) {
        (group as any)._invitationToken = this.invitationToken;
    }

    return group;
}
}