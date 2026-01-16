import { Group } from "../entity/Group";
import { GroupId } from "../valueObject/GroupId";
import { GroupName } from "../valueObject/GroupName";
import { GroupDescription } from "../valueObject/GroupDescription";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { Optional } from "src/lib/shared/Type Helpers/Optional";

export class GroupBuilder {
  private id: GroupId = GroupId.create("123e4567-e89b-42d3-a456-426614174123");
  private name: GroupName = GroupName.create("Grupo Default");
  private description: Optional<GroupDescription> = new Optional(GroupDescription.create("Descripcion"));
  private adminId: UserId = new UserId("123e4567-e89b-42d3-a456-426614174123");
  private members: UserId[] = [];

  public withAdmin(adminId: string): this {
    this.adminId = new UserId(adminId);
    return this;
  }

  public withMember(userId: string): this {
    this.members.push(new UserId(userId));
    return this;
  }

  public build(): Group {
    const group = Group.create(this.id, this.name, this.description.getValue(), this.adminId);
    this.members.forEach(memberId => {
        if (memberId.value !== this.adminId.value) {
            group.addMember(memberId);
        }
    });
    
    return group;
  }
}