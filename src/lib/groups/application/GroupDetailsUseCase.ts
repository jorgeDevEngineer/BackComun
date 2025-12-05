import { Group } from "../domain/entity/Group";
import { UserNotMemberOfGroupError } from "../domain/NotMemberGroupError";
import { GroupRepository } from "../domain/port/GroupRepository";
import { GroupId } from "../domain/valueObject/GroupId";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { GroupNotFoundError } from "../domain/GroupNotFoundError";

export interface GetGroupDetailInput {
  groupId: string;
  currentUserId: string;
}

export interface GroupMemberDto {
  userId: string;
  role: string;
  joinedAt: string;
  completedQuizzes: number;
}

export interface GetGroupDetailOutput {
  id: string;
  name: string;
  description: string;
  adminId: string;
  members: GroupMemberDto[];
  createdAt: string;
  updatedAt: string;
}

export class GetGroupDetailUseCase {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(input: GetGroupDetailInput): Promise<GetGroupDetailOutput> {
    const groupId = GroupId.of(input.groupId);
    const currentUserId = UserId.of(input.currentUserId);

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new GroupNotFoundError(input.groupId);
    }
    const plain = group.toPlainObject();
    const isMember = plain.members.some((m) => m.userId === currentUserId.value);
    if (!isMember) {
      throw new UserNotMemberOfGroupError(input.currentUserId, input.groupId);
    }

    return {
      id: plain.id,
      name: plain.name,
      description: plain.description,
      adminId: plain.adminId,
      members: plain.members.map((m) => ({
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt,
        completedQuizzes: m.completedQuizzes,
      })),
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    };
  }
}
