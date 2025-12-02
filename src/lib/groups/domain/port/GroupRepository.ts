import { Group } from "../entity/Group";
import { GroupId } from "../valueObject/GroupId";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";

export interface GroupRepository {
  findById(id: GroupId): Promise<Group | null>;

  //para listar grupos de un usuario
  findByMember(userId: UserId): Promise<Group[]>;

  save(group: Group): Promise<void>;
  findByInvitationToken(token: string): Promise<Group | null>;
}