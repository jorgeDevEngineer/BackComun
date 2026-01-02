import { IHandler } from "src/lib/shared/IHandler";

import { GroupRepository } from "../../../domain/port/GroupRepository";
import { GroupId } from "../../../domain/valueObject/GroupId";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { InvitationTokenGenerator } from "../../../domain/port/GroupInvitationTokenGenerator";

import { GenerateGroupInvitationCommand } from "../../parameterObjects/GenerateGroupInvitationCommand";
import { GenerateGroupInvitationResponseDto } from "../../dtos/GroupResponse.dto";

export class GenerateGroupInvitationCommandHandler
  implements
    IHandler<GenerateGroupInvitationCommand, GenerateGroupInvitationResponseDto>
{
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly tokenGenerator: InvitationTokenGenerator,
  ) {}

  async execute(
    command: GenerateGroupInvitationCommand,
  ): Promise<GenerateGroupInvitationResponseDto> {
    const now = command.now ?? new Date();
    const ttlDays = command.ttlDays ?? 7;

    const groupId = GroupId.of(command.groupId);
    const currentUserId = new UserId(command.currentUserId);

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    if (group.adminId.value !== currentUserId.value) {
      throw new Error("solo el administrador del grupo puede generar invitaciones");
    }

    group.generateInvitation(this.tokenGenerator, ttlDays, now);

    await this.groupRepository.save(group);

    const Base_URL = "http://QuizGo.app/groups/join/";
    const token = group.invitationToken!;
    const fullInvitationLink = `${Base_URL}${token.token}`;

    return {
      groupId: group.id.value,
      Link: fullInvitationLink,
      expiresAt: token.expiresAt.toISOString(),
    };
  }
}