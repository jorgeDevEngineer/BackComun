import { GroupRepository } from "../domain/port/GroupRepository";
import { GroupId } from "../domain/valueObject/GroupId";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { GroupNotFoundError } from "../domain/GroupNotFoundError";
import { NotGroupAdminError } from "./RemoveGroupMemberUseCase";

export interface TransferGroupAdminInput {
  groupId: string;
  currentUserId: string;
  newAdminUserId: string;
  now?: Date;
}

export interface TransferGroupAdminOutput {
  groupId: string;
  oldAdminId: string;
  newAdminId: string;
}

export class CannotTransferAdminToNonMemberError extends Error {
  constructor(message = "New admin must be a member of the group") {
    super(message);
    this.name = "CannotTransferAdminToNonMemberError";
  }
}

export class TransferGroupAdminUseCase {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(
    input: TransferGroupAdminInput,
  ): Promise<TransferGroupAdminOutput> {
    const now = input.now ?? new Date();

    const groupId = GroupId.of(input.groupId);
    const currentAdminId = UserId.of(input.currentUserId);
    const newAdminId = UserId.of(input.newAdminUserId);

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new GroupNotFoundError(input.groupId);
    }
    if (group.adminId.value !== currentAdminId.value) {
      throw new NotGroupAdminError("Only current admin can transfer admin role");
    }
    if (currentAdminId.value === newAdminId.value) {
      throw new CannotTransferAdminToNonMemberError(
        "New admin must be different from current admin",
      );
    }
    const isMember = group.members.some(
      (m) => m.userId.value === newAdminId.value,
    );
    if (!isMember) {
      throw new CannotTransferAdminToNonMemberError();
    }
    group.transferAdmin(currentAdminId, newAdminId, now);

    await this.groupRepository.save(group);

    return {
      groupId: group.id.value,
      oldAdminId: currentAdminId.value,
      newAdminId: newAdminId.value,
    };
  }
}