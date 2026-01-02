import { GroupRepository } from "../../../domain/port/GroupRepository";
import{ UserId } from "src/lib/user/domain/valueObject/UserId";
import { IHandler } from "src/lib/shared/IHandler";
import {JoinGroupByInvitationCommand} from "../../parameterObjects/JoinGroupByInvitationCommand";
import { JoinGroupByInvitationResponseDto } from "../../dtos/GroupResponse.dto";

export class JoinGroupByInvitationCommandHandler
  implements IHandler<JoinGroupByInvitationCommand, JoinGroupByInvitationResponseDto>
{
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(
    command: JoinGroupByInvitationCommand,
  ): Promise<JoinGroupByInvitationResponseDto> {
    const now = command.now ?? new Date();
    const userId = new UserId(command.currentUserId);

    const group = await this.groupRepository.findByInvitationToken(command.token);
    if (!group) {
      throw new Error("Invalid invitation token");
    }

    const invitation = group.invitationToken;
    if (!invitation) {
      throw new Error("This group has no active invitation");
    }

    if (invitation.isExpired(now)) {
      throw new Error("Invitation token has expired");
    }

    // Regla de máximo 5 miembros en free se debe implementar la validacion
    if (group.members.length >= 5) {
      console.log("Grupo alcanzó el límite free de 5 miembros (dominio no lo rompe).");
    }

    group.addMember(userId, now);

    await this.groupRepository.save(group);

    return {
      groupId: group.id.value,
      joinedAs: "member",
    };
  }
}