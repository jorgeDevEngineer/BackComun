// src/lib/groups/application/UpdateGroupInfoUseCase.ts
import { GroupRepository } from "../domain/port/GroupRepository";
import { GroupId } from "../domain/valueObject/GroupId";
import { GroupName } from "../domain/valueObject/GroupName";
import { GroupDescription } from "../domain/valueObject/GroupDescription";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { GroupNotFoundError } from "./LeaveGroupUseCase";
import { NotGroupAdminError } from "./RemoveGroupMemberUseCase";

export interface UpdateGroupInfoInput {
  groupId: string;
  currentUserId: string;
  name?: string;
  description?: string;
  now?: Date;
}

export interface UpdateGroupInfoOutput {
  groupId: string;
  name: string;
  description: string;
}

export class InvalidGroupUpdatePayloadError extends Error {
  constructor(message = "At least one of name or description must be provided") {
    super(message);
    this.name = "InvalidGroupUpdatePayloadError";
  }
}

export class UpdateGroupInfoUseCase {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(
    input: UpdateGroupInfoInput,
  ): Promise<UpdateGroupInfoOutput> {
    const now = input.now ?? new Date();

    if (!input.name && input.description === undefined) {
      throw new InvalidGroupUpdatePayloadError();
    }

    const groupId = GroupId.of(input.groupId);
    const userId = UserId.of(input.currentUserId);

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new GroupNotFoundError();
    }

    if (group.adminId.value !== userId.value) {
      throw new NotGroupAdminError("Only admin can edit group info");
    }

    const newName = input.name
      ? GroupName.of(input.name)
      : group.name;

    const newDescription =
      input.description !== undefined
        ? GroupDescription.of(input.description)
        : group.description ?? GroupDescription.of("");

    group.rename(newName, newDescription, now);

    await this.groupRepository.save(group);

    return {
      groupId: group.id.value,
      name: group.name.value,
      description: group.description?.value ?? "",
    };
  }
}