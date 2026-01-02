import { IHandler } from "src/lib/shared/IHandler";

import { RemoveGroupMemberCommand } from "../../parameterObjects/RemoveGroupMemberCommand";
import { RemoveGroupMemberResponseDto } from "../../dtos/GroupResponse.dto";

import { GroupRepository } from "../../../domain/port/GroupRepository";
import { GroupId } from "../../../domain/valueObject/GroupId";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { GroupNotFoundError } from "../../../domain/GroupNotFoundError";
import { UserNotMemberOfGroupError } from "../../../domain/NotMemberGroupError";

export class RemoveGroupMemberCommandHandler
  implements IHandler<RemoveGroupMemberCommand, RemoveGroupMemberResponseDto>
{
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(
      command: RemoveGroupMemberCommand,
    ): Promise<RemoveGroupMemberResponseDto> {
      const now = command.now ?? new Date();

      const groupId = GroupId.of(command.groupId);
      const adminId = new UserId(command.currentUserId);
      const targetId = new UserId(command.memberId);
  
      const group = await this.groupRepository.findById(groupId);
      if (!group) {
        throw new GroupNotFoundError(command.groupId);
      }
  
      if (group.adminId.value !== adminId.value) {
        throw new Error("Solo el administrador del grupo puede realizar esta acción");
      }
  
      if (adminId.value === targetId.value) {
        throw new Error("El administrador no puede eliminarse a sí mismo del grupo");
      }
  
      const isMember = group.members.some(
        (m) => m.userId.value === targetId.value,
      );
      if (!isMember) {
        throw new UserNotMemberOfGroupError(command.memberId, command.groupId);
      }
      
      group.removeMember(targetId, now);
  
      await this.groupRepository.save(group);
  
      return {
        groupId: group.id.value,
        removedUserId: targetId.value,
      };
    }
  }