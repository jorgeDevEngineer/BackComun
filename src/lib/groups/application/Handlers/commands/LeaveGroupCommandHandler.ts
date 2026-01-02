import { IHandler } from "src/lib/shared/IHandler";

import { LeaveGroupCommand } from "../../parameterObjects/LeaveGroupCommand";
import { LeaveGroupResponseDto } from "../../dtos/GroupResponse.dto";

import { GroupRepository } from "../../../domain/port/GroupRepository";
import { GroupId } from "../../../domain/valueObject/GroupId";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { GroupNotFoundError } from "../../../domain/GroupNotFoundError";
import { UserNotMemberOfGroupError } from "../../../domain/NotMemberGroupError";

export class LeaveGroupCommandHandler
  implements IHandler<LeaveGroupCommand, LeaveGroupResponseDto>
{
  constructor(private readonly groupRepository: GroupRepository) {}
    async execute(command: LeaveGroupCommand): Promise<LeaveGroupResponseDto> {
        const now = command.now ?? new Date();

        const groupId = GroupId.of(command.groupId);
        const userId = new UserId(command.currentUserId);
    
        const group = await this.groupRepository.findById(groupId);
        if (!group) {
          throw new GroupNotFoundError(command.groupId);
        }
    
        if (group.adminId.value === userId.value) {
          throw new Error("El administrador no puede abandonar el grupo sin transferir el rol de administrador");
        }
    
        const isMember = group.members.some(
          (m) => m.userId.value === userId.value,
        );
        if (!isMember) {
          throw new UserNotMemberOfGroupError(command.currentUserId, command.groupId);
        }
    
        group.removeMember(userId, now);
    
        await this.groupRepository.save(group);
    
        return {
          groupId: group.id.value,
          left: true,
        };
      }
    }




