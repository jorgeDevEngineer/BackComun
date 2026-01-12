import { IHandler } from "src/lib/shared/IHandler";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { GroupBusinessException } from "src/lib/shared/exceptions/GroupGenException";
import { GroupNotFoundError } from "src/lib/shared/exceptions/GroupNotFoundError";
import { UserNotMemberOfGroupError } from "../../../../shared/exceptions/NotMemberGroupError";

import { LeaveGroupCommand } from "../../parameterObjects/LeaveGroupCommand";
import { LeaveGroupResponseDto } from "../../dtos/GroupResponse.dto";

import { GroupRepository } from "../../../domain/port/GroupRepository";
import { GroupId } from "../../../domain/valueObject/GroupId";
import { UserId } from "src/lib/user/domain/valueObject/UserId";

export class LeaveGroupCommandHandler
  implements IHandler<LeaveGroupCommand, Either<DomainException, LeaveGroupResponseDto>>
{
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(command: LeaveGroupCommand): Promise<Either<DomainException, LeaveGroupResponseDto>> {
    const now = command.now ?? new Date();
    const groupId = GroupId.of(command.groupId);
    const userId = new UserId(command.currentUserId);

    const groupOptional = await this.groupRepository.findById(groupId);
    if (!groupOptional.hasValue()) {
      return Either.makeLeft(new GroupNotFoundError(command.groupId));
    }
    const group = groupOptional.getValue();

    if (group.adminId.value === userId.value) {
      return Either.makeLeft(new GroupBusinessException("El administrador no puede abandonar el grupo, debe transferir la administración"));
    }

    const isMember = group.members.some(
      (m) => m.userId.value === userId.value,
    );
    if (!isMember) {
      return Either.makeLeft(new UserNotMemberOfGroupError(command.currentUserId, command.groupId));
    }

    try {
      group.removeMember(userId, now);
    } catch (e) {
      return Either.makeLeft(new GroupBusinessException(e.message));
    }

    await this.groupRepository.save(group);

    return Either.makeRight({
      groupId: group.id.value,
      left: true,
    });
  }
}