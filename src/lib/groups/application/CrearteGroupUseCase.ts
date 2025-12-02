import { randomUUID } from "node:crypto";

import { GroupRepository } from "../domain/port/GroupRepository";
import { Group } from "../domain/entity/Group";
import { GroupId } from "../domain/valueObject/GroupId";
import { GroupName } from "../domain/valueObject/GroupName";
import { GroupDescription } from "../domain/valueObject/GroupDescription";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";


export class CreateGroupRequestDto {
  name!: string; // requerido por la API única
}

export class CreateGroupResponseDto {
  id!: string;
  name!: string;
  adminId!: string;
  memberCount!: number;
  createdAt!: string;
}

export interface CreateGroupInput {
  name: string;
  currentUserId: string;
  now?: Date;
}

export interface CreateGroupOutput {
  id: string;
  name: string;
  adminId: string;
  memberCount: number;
  createdAt: string;
}

export class CreateGroupUseCase {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(input: CreateGroupInput): Promise<CreateGroupOutput> {
    const now = input.now ?? new Date();

    // 1) Generar ID fuera del dominio y validarlo con el VO
    const rawId = randomUUID();
    const groupId = GroupId.of(rawId); // tu VO valida UUID v4

    // 2) Value Object del nombre
    const groupName = GroupName.of(input.name);

    // 3) Descripción, por ahora vacía por defecto
    const groupDescription = GroupDescription.of("");

    // 4) adminId = usuario actual
    const adminId = UserId.of(input.currentUserId);

    // Crear el aggregate (aquí se crea también el miembro admin dentro del grupo)
    const group = Group.create(
      groupId,
      groupName,
      groupDescription,
      adminId,
      now,
    );

    //Persistir en el repositorio
    await this.groupRepository.save(group);

    //Armar respuesta plana para el controller / API única
    return {
      id: group.id.value,
      name: group.name.value,
      adminId: group.adminId.value,
      memberCount: group.members.length,
      createdAt: group.createdAt.toISOString(),
    };
  }
}