import { IHandler } from "src/lib/shared/IHandler";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { GroupBusinessException } from "src/lib/shared/exceptions/GroupGenException";
import { GroupNotFoundError } from "src/lib/shared/exceptions/GroupNotFoundError";

import { GroupRepository } from "../../../domain/port/GroupRepository";
import { GroupId } from "../../../domain/valueObject/GroupId";
import { GroupName } from "../../../domain/valueObject/GroupName";
import { GroupDescription } from "../../../domain/valueObject/GroupDescription";
import { UserId } from "src/lib/user/domain/valueObject/UserId";

import { UpdateGroupDetailsCommand } from "../../parameterObjects/UpdateGroupDetailsCommand";
import { UpdateGroupDetailsResponseDto } from "../../dtos/GroupResponse.dto";

export class UpdateGroupDetailsCommandHandler
  implements IHandler<UpdateGroupDetailsCommand, Either<DomainException, UpdateGroupDetailsResponseDto>>
{
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(command: UpdateGroupDetailsCommand): Promise<Either<DomainException, UpdateGroupDetailsResponseDto>> {
    
    const now = command.now ?? new Date();

    if (!command.name && command.description === undefined) {
      return Either.makeLeft(new GroupBusinessException("No se proporcionaron detalles para actualizar"));
    }

    const groupId = GroupId.of(command.groupId);
    const userId = new UserId(command.currentUserId);

    const groupOptional = await this.groupRepository.findById(groupId);
    if (!groupOptional.hasValue()) {
      return Either.makeLeft(new GroupNotFoundError(command.groupId));
    }
    const group = groupOptional.getValue();

    if (group.adminId.value !== userId.value) {
      return Either.makeLeft(new GroupBusinessException("Solo el administrador del grupo puede actualizar los detalles del grupo"));
    }

    const newName = command.name 
      ? GroupName.of(command.name) 
      : group.name;

    let newDescription: GroupDescription;
    if (command.description !== undefined && command.description !== null) {
      newDescription = GroupDescription.of(command.description);
    } else {
      newDescription = group.description.hasValue() 
        ? group.description.getValue() 
        : GroupDescription.of("");
    }

    try {
      group.rename(newName, newDescription, now);
    } catch (e) {
      return Either.makeLeft(new GroupBusinessException(e.message));
    }

    await this.groupRepository.save(group);

    return Either.makeRight({
      groupId: group.id.value,
      name: group.name.value,
      description: group.description.hasValue() 
        ? group.description.getValue().value 
        : "",
    });
  }
}