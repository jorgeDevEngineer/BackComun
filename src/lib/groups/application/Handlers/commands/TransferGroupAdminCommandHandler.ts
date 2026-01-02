import { IHandler } from "src/lib/shared/IHandler";
import { TransferGroupAdminCommand } from "../../parameterObjects/TransferGroupAdminCommand";
import { TransferGroupAdminResponseDto } from "../../dtos/GroupResponse.dto";


import { GroupRepository } from "../../../domain/port/GroupRepository";
import { GroupId } from "../../../domain/valueObject/GroupId";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { GroupNotFoundError } from "../../../domain/GroupNotFoundError";

export class TransferGroupAdminCommandHandler
  implements IHandler<TransferGroupAdminCommand, any>
{
  constructor(private readonly groupRepository: GroupRepository) {}
  async execute(
      command: TransferGroupAdminCommand,
    ): Promise<TransferGroupAdminResponseDto> {
      const now = command.now ?? new Date();

      const groupId = GroupId.of(command.groupId);
      const currentAdminId = new UserId(command.currentUserId);
      const newAdminId = new UserId(command.newAdminUserId);
  
      const group = await this.groupRepository.findById(groupId);
      if (!group) {
        throw new GroupNotFoundError(command.groupId);
      }
      if (group.adminId.value !== currentAdminId.value) {
        throw new Error("solo el administrador del grupo puede transferir el rol de administrador");
      }
      if (currentAdminId.value === newAdminId.value) {
        throw new Error(
          "El nuevo administrador debe ser diferente del administrador actual",
        );
      }
      const isMember = group.members.some(
        (m) => m.userId.value === newAdminId.value,
      );
      if (!isMember) {
        throw new Error("El nuevo administrador debe ser un miembro del grupo");
      }
      group.transferAdmin(currentAdminId, newAdminId, now);
  
      await this.groupRepository.save(group);
  
      return {
        groupId: group.id.value,
        oldAdminUserId: currentAdminId.value,
        newAdminUserId: newAdminId.value,
      };
    }
  }