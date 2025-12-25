import { GroupRepository } from "../domain/port/GroupRepository";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";

export interface GetUserGroupsInput {
  currentUserId: string;
}

export interface GetUserGroupsOutput {
  id: string;
  name: string;
  adminId: string;
  memberCount: number;
  createdAt: string;
}

export class GetUserGroupsUseCase {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(input: GetUserGroupsInput): Promise<GetUserGroupsOutput[]> {
    const userId = UserId.of(input.currentUserId);

    const groups = await this.groupRepository.findByMember(userId);

    return groups.map((group) => {
      const plain = group.toPlainObject();
      return {
        id: plain.id,
        name: plain.name,
        adminId: plain.adminId,
        memberCount: plain.members.length,
        createdAt: plain.createdAt,
      };
    });
  }
}