import { IHandler } from "src/lib/shared/IHandler";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { GroupNotFoundError } from "src/lib/shared/exceptions/GroupNotFoundError";
import { UserNotMemberOfGroupError } from "../../../../shared/exceptions/NotMemberGroupError";

import { GetGroupQuizzesQuery } from "../../parameterObjects/GetGroupQuizzesQuery";
import { GetGroupAssignedQuizzesResponseDto } from "../../dtos/GroupResponse.dto";

import { GroupRepository } from "../../../domain/port/GroupRepository";
import { GroupId } from "../../../domain/valueObject/GroupId";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { GameProgressStatus } from "src/lib/singlePlayerGame/domain/valueObjects/SinglePlayerGameVOs";

export class GetGroupQuizzesQueryHandler
  implements IHandler<GetGroupQuizzesQuery, Either<DomainException, GetGroupAssignedQuizzesResponseDto>>
{
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(query: GetGroupQuizzesQuery): Promise<Either<DomainException, GetGroupAssignedQuizzesResponseDto>> {
    
    const groupId = GroupId.of(query.groupId);
    const currentUserId = new UserId(query.currentUserId);

    const groupOptional = await this.groupRepository.findById(groupId);
    if (!groupOptional.hasValue()) {
      return Either.makeLeft(new GroupNotFoundError(query.groupId));
    }
    const group = groupOptional.getValue();

    const isMember = group.members.some(m => m.userId.value === currentUserId.value);
    if (!isMember) {
      return Either.makeLeft(new UserNotMemberOfGroupError(currentUserId.value, groupId.value));
    }

    const assignments = await this.groupRepository.findAssignmentsByGroupId(groupId);
    const quizIds = [...new Set(assignments.map(a => a.quizId))];

    // Se usa 'as any' porque GroupRepository no debería exponer esto en su interfaz
    let quizzes: any[] = [];
    if (quizIds.length > 0) {
      quizzes = await (this.groupRepository as any).quizRepo.find({
        where: { id: quizIds }, 
        select: { id: true, title: true }
      });
    }
    const quizTitleMap = new Map(quizzes.map((q: any) => [q.id, q.title]));

    let completedAttempts: any[] = [];
    if (quizIds.length > 0) {
      completedAttempts = await (this.groupRepository as any).gameRepo.find({
        where: {
          playerId: currentUserId.value,
          quizId: quizIds,
          status: GameProgressStatus.COMPLETED,
        },
        order: { startedAt: "DESC" },
      });
    }

    const attemptsByQuiz = new Map<string, any[]>();
    for (const at of completedAttempts) {
      const arr = attemptsByQuiz.get(at.quizId) ?? [];
      arr.push(at);
      attemptsByQuiz.set(at.quizId, arr);
    }

    const data = assignments.map(a => {
      const effectiveAssignedAt = a.availableFrom ?? a.createdAt;

      // Filtramos intentos hechos DESPUÉS de la asignación
      const candidates = (attemptsByQuiz.get(a.quizId) ?? [])
        .filter((at: any) => at.startedAt >= effectiveAssignedAt)
        .sort((x: any, y: any) => x.startedAt.getTime() - y.startedAt.getTime());

      const firstCompletedAfterAssign = candidates[0];
      const status: "PENDING" | "COMPLETED" = firstCompletedAfterAssign ? "COMPLETED" : "PENDING";

      return {
        assignmentId: a.id,
        quizId: a.quizId,
        title: quizTitleMap.get(a.quizId) ?? null,
        availableUntil: a.availableUntil ?? null,
        status,
        userResult: firstCompletedAfterAssign
          ? {
              score: firstCompletedAfterAssign.score,
              attemptId: firstCompletedAfterAssign.gameId,
              completedAt: firstCompletedAfterAssign.completedAt,
            }
          : null,
        leaderboard: [], // TODO: Por implementar
      };
    });

    return Either.makeRight({ data });
  }
}