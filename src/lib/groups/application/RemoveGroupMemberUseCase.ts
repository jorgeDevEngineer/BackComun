import { GroupRepository } from "../domain/port/GroupRepository";
import { GroupId } from "../domain/valueObject/GroupId";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import {
  GroupNotFoundError,
  UserNotMemberOfGroupError,
} from "./LeaveGroupUseCase";

export class NotGroupAdminError extends Error {
  constructor(message = "Only group admin can perform this action") {
    super(message);
    this.name = "NotGroupAdminError";
  }
}

export class CannotRemoveAdminError extends Error {
  constructor(message = "Admin cannot remove themselves from the group") {
    super(message);
    this.name = "CannotRemoveAdminError";
  }
}

export interface RemoveGroupMemberInput {
  groupId: string;
  targetUserId: string;   
  currentUserId: string;  
  now?: Date;
}

export interface RemoveGroupMemberOutput {
  groupId: string;
  removedUserId: string;
}

export class RemoveGroupMemberUseCase {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(
    input: RemoveGroupMemberInput,
  ): Promise<RemoveGroupMemberOutput> {
    const now = input.now ?? new Date();

    const groupId = GroupId.of(input.groupId);
    const adminId = UserId.of(input.currentUserId);
    const targetId = UserId.of(input.targetUserId);

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new GroupNotFoundError();
    }

    if (group.adminId.value !== adminId.value) {
      throw new NotGroupAdminError();
    }

    if (adminId.value === targetId.value) {
      throw new CannotRemoveAdminError();
    }

    const isMember = group.members.some(
      (m) => m.userId.value === targetId.value,
    );
    if (!isMember) {
      throw new UserNotMemberOfGroupError(
        "Target user is not a member of this group",
      );
    }

    group.removeMember(targetId, now);

    await this.groupRepository.save(group);

    return {
      groupId: group.id.value,
      removedUserId: targetId.value,
    };
  }
}