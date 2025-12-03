import { GroupRepository } from "../domain/port/GroupRepository";
import { GroupId } from "../domain/valueObject/GroupId";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";

export interface LeaveGroupInput {
  groupId: string;
  currentUserId: string;
  now?: Date;
}

export interface LeaveGroupOutput {
  groupId: string;
  left: boolean;
}

export class GroupNotFoundError extends Error {
  constructor(message = "Group not found") {
    super(message);
    this.name = "GroupNotFoundError";
  }
}

export class CannotLeaveAsAdminError extends Error {
  constructor(message = "Admin cannot leave the group without transferring admin role") {
    super(message);
    this.name = "CannotLeaveAsAdminError";
  }
}

export class UserNotMemberOfGroupError extends Error {
  constructor(message = "User is not a member of this group") {
    super(message);
    this.name = "UserNotMemberOfGroupError";
  }
}

export class LeaveGroupUseCase {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(input: LeaveGroupInput): Promise<LeaveGroupOutput> {
    const now = input.now ?? new Date();

    const groupId = GroupId.of(input.groupId);
    const userId = UserId.of(input.currentUserId);

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new GroupNotFoundError();
    }

    if (group.adminId.value === userId.value) {
      throw new CannotLeaveAsAdminError();
    }

    const isMember = group.members.some(
      (m) => m.userId.value === userId.value,
    );
    if (!isMember) {
      throw new UserNotMemberOfGroupError();
    }

    group.removeMember(userId, now);

    await this.groupRepository.save(group);

    return {
      groupId: group.id.value,
      left: true,
    };
  }
}