import { randomUUID } from "node:crypto";

import { IHandler } from "../../../../shared/IHandler";
import { AssignQuizToGroupCommand } from "../../parameterObjects/AssignQuizToGroupCommand";

import { AssignQuizToGroupResponseDto } from "../../dtos/GroupResponse.dto";

import { GroupRepository } from "../../../domain/port/GroupRepository";
import { GroupId } from "../../../domain/valueObject/GroupId";
import { GroupQuizAssignment } from "../../../domain/entity/GroupQuizAssigment";
import { GroupQuizAssignmentId } from "../../../domain/valueObject/GroupQuizAssigmentId";

import { QuizId} from "../../../../kahoot/domain/valueObject/Quiz";
import { UserId } from "../../../../user/domain/valueObject/UserId";
import { GroupNotFoundError } from "../../../domain/GroupNotFoundError";
import { UserNotMemberOfGroupError } from "../../../domain/NotMemberGroupError";
import { QuizReadService } from "../../../domain/port/QuizReadService";

export class AssignQuizToGroupCommandHandler
  implements IHandler<AssignQuizToGroupCommand, AssignQuizToGroupResponseDto>
{
  constructor(private readonly groupRepository: GroupRepository,private readonly quizReadService: QuizReadService,
  ) {}
  async execute(command: AssignQuizToGroupCommand): Promise<AssignQuizToGroupResponseDto> {
    const now = command.now ?? new Date();
    const availableFrom = now;

    const availableUntil = command.availableUntil;
    if (!availableUntil) {
      throw new Error("availableUntil is required");
    }
    
    const groupId = GroupId.of(command.groupId);
    const quizId = QuizId.of(command.quizId);
    const userId = new UserId(command.currentUserId);
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new GroupNotFoundError(command.groupId);
    }

    const isMember = group.members.some(
      (m) => m.userId.value === userId.value,
    );
    if (!isMember) {
      throw new UserNotMemberOfGroupError(command.currentUserId, command.groupId);
    }
    
    const canUseQuiz = await this.quizReadService.quizBelongsToUser(
      quizId,
      userId,
    );
    if (!canUseQuiz) {
      throw new Error('El quiz no existe o no pertenece al usuario');
    }

    const assignment = GroupQuizAssignment.create(
      GroupQuizAssignmentId.of(randomUUID()),
      quizId,
      userId,
      availableFrom,
      availableUntil,
      now,
    );

    group.assignQuiz(assignment, now);

    await this.groupRepository.save(group);

    return {
      id: assignment.id.value,
      groupId: group.id.value,
      quizId: assignment.quizId.value,
      assignedBy: assignment.assignedBy.value,
      createdAt: assignment.createdAt.toISOString(),
      availableFrom: assignment.availableFrom.toISOString(),  
      availableUntil: availableUntil.toISOString(),
      isActive: assignment.isActive,
    };
  }
}
