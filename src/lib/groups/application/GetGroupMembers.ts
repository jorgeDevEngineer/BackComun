import { GroupRepository } from "../domain/port/GroupRepository";
import { GroupId } from "../domain/valueObject/GroupId";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";

export interface GetGroupMembersInput {
  groupId: string;
  currentUserId: string;
}

export interface GroupMemberDto {
  userId: string;
  role: string;
  joinedAt: string;
  completedQuizzes: number;
}

export interface GetGroupMembersOutput {
  name: string;
  members: GroupMemberDto[];
}

export class GetGroupMembersUseCase {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(input: GetGroupMembersInput): Promise<GetGroupMembersOutput> {
    const groupId = GroupId.of(input.groupId);
    const currentUserId = UserId.of(input.currentUserId);

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new Error("Group not found");
    }
    const plain = group.toPlainObject();
    const isMember = plain.members.some(
      (m) => m.userId === currentUserId.value,
    );
    if (!isMember) {
      throw new Error("Forbidden: user is not a member of this group");
    }

    return {
      name: plain.name,
      members: plain.members.map((m) => ({
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt,
        completedQuizzes: m.completedQuizzes,
      })),
    };
  }
}
