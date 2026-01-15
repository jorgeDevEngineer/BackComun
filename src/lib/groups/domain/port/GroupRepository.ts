import { Group, GroupQuizAssignmentPrimitive } from "../entity/Group";
import { GroupId } from "../valueObject/GroupId";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { Optional } from  "src/lib/shared/Type Helpers/Optional";

export interface GroupRepository {
  findById(id: GroupId): Promise<Optional<Group>>;
  
  findByInvitationToken(token: string): Promise<Optional<Group>>;

  findByMember(userId: UserId): Promise<Group[]>;

  save(group: Group): Promise<void>;

  findAssignmentsByGroupId(groupId: GroupId): Promise<GroupQuizAssignmentPrimitive[]>;


}