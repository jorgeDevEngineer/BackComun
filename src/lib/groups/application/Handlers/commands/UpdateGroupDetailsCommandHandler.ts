import { GroupRepository } from "../../../domain/port/GroupRepository";
import { GroupId } from "../../../domain/valueObject/GroupId";
import { GroupName } from "../../../domain/valueObject/GroupName";
import { GroupDescription } from "../../../domain/valueObject/GroupDescription";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { GroupNotFoundError } from "../../../domain/GroupNotFoundError";

import { IHandler } from "src/lib/shared/IHandler";
import { UpdateGroupDetailsCommand } from "../../parameterObjects/UpdateGroupDetailsCommand";
import { UpdateGroupDetailsResponseDto } from "../../dtos/GroupResponse.dto";

export class UpdateGroupDetailsCommandHandler
  implements IHandler<UpdateGroupDetailsCommand, UpdateGroupDetailsResponseDto>
{
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(command: UpdateGroupDetailsCommand): Promise<UpdateGroupDetailsResponseDto> {
    const now = command.now ?? new Date();

    if (!command.name && command.description === undefined) {
      throw new Error(
        "al menos un campo (nombre o descripción) debe ser proporcionado para la actualización",
      );
    }

    const groupId = GroupId.of(command.groupId);
    const userId = new UserId(command.currentUserId);

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new GroupNotFoundError(command.groupId);
    }

    if (group.adminId.value !== userId.value) {
      throw new Error("Solo el administrador puede editar la información del grupo");
    }

    let newName = group.name;
    if (command.name) {
      newName = GroupName.of(command.name);
    }

    let newDescription = group.description ?? GroupDescription.of("");
    if (command.description !== undefined) {
      newDescription = GroupDescription.of(command.description);
    }

    group.rename(newName, newDescription, now);

    await this.groupRepository.save(group);

    return {
      groupId: group.id.value,
      name: group.name.value,
      description: group.description?.value ?? "",
    };
  }
}