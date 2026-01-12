import { randomUUID } from "node:crypto";

import { IHandler } from "src/lib/shared/IHandler";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { GroupBusinessException } from "src/lib/shared/exceptions/GroupGenException";
import { GroupNotFoundError } from "src/lib/shared/exceptions/GroupNotFoundError";
import { UserNotMemberOfGroupError } from "../../../../shared/exceptions/NotMemberGroupError";

import { AssignQuizToGroupCommand } from "../../parameterObjects/AssignQuizToGroupCommand";
import { AssignQuizToGroupResponseDto } from "../../dtos/GroupResponse.dto";

import { GroupRepository } from "../../../domain/port/GroupRepository";
import { QuizReadService } from "../../../domain/port/QuizReadService";
import { GroupId } from "../../../domain/valueObject/GroupId";
import { GroupQuizAssignment } from "../../../domain/entity/GroupQuizAssigment";
import { GroupQuizAssignmentId } from "../../../domain/valueObject/GroupQuizAssigmentId";
import { QuizId } from "../../../../kahoot/domain/valueObject/Quiz";
import { UserId } from "../../../../user/domain/valueObject/UserId";

import { EventEmitter2 } from "@nestjs/event-emitter";
import { QuizAssignedToGroupEvent } from "../../../../shared/domain/Events/QuizAssignedToGroupEvent";

export class AssignQuizToGroupCommandHandler
  implements IHandler<AssignQuizToGroupCommand, Either<DomainException, AssignQuizToGroupResponseDto>>
{
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly quizReadService: QuizReadService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: AssignQuizToGroupCommand): Promise<Either<DomainException, AssignQuizToGroupResponseDto>> {
    const now = command.now ?? new Date();
    const availableFrom = now;
    const availableUntil = command.availableUntil;

    if (!availableUntil) {
      return Either.makeLeft(new GroupBusinessException("La fecha de disponibilidad es obligatoria"));
    }

    const groupId = GroupId.of(command.groupId);
    const quizId = QuizId.of(command.quizId);
    const userId = new UserId(command.currentUserId);
    const quizTitle = await this.getQuizTitle(quizId);
    const assignerName = "El administrador"

    const groupOptional = await this.groupRepository.findById(groupId);
    if (!groupOptional.hasValue()) {
      return Either.makeLeft(new GroupNotFoundError(command.groupId));
    }
    const group = groupOptional.getValue();

    const isMember = group.members.some((m) => m.userId.value === userId.value);
    if (!isMember) {
      return Either.makeLeft(new UserNotMemberOfGroupError(command.currentUserId, command.groupId));
    }

    const canUseQuiz = await this.quizReadService.quizBelongsToUser(quizId, userId);
    if (!canUseQuiz) {
      return Either.makeLeft(new GroupBusinessException("El quiz no existe o no pertenece al usuario"));
    }

    const assignment = GroupQuizAssignment.create(
      GroupQuizAssignmentId.of(randomUUID()),
      quizId,
      userId,
      availableFrom,
      availableUntil,
      now,
    );

    try {
      group.assignQuiz(assignment, now);
    } catch (e) {
      return Either.makeLeft(new GroupBusinessException(e.message));
    }

    await this.groupRepository.save(group);
    const memberIdsToNotify = group.members
        .filter(m => m.userId.value !== userId.value)
        .map(m => m.userId.value);

    if (memberIdsToNotify.length > 0) {
        this.eventEmitter.emit(
            'quiz.assigned',
            new QuizAssignedToGroupEvent(
                group.id.value,
                quizId.value,
                group.name.value,
                quizTitle,      
                assignerName,  
                memberIdsToNotify,
                new Date()
            )
        );
    }

    

    return Either.makeRight({
      id: assignment.id.value,
      groupId: group.id.value,
      quizId: assignment.quizId.value,
      assignedBy: assignment.assignedBy.value,
      createdAt: assignment.createdAt.toISOString(),
      availableFrom: assignment.availableFrom.toISOString(),
      availableUntil: availableUntil.toISOString(),
      isActive: assignment.isActive,
    });
  }
  private async getQuizTitle(id: QuizId): Promise<string> {
      return "Quiz de Prueba"; //arreglar esto
  }
}