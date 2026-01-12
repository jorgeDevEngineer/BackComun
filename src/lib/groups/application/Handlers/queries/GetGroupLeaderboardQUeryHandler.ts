import { IHandler } from "src/lib/shared/IHandler";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { GroupNotFoundError } from "src/lib/shared/exceptions/GroupNotFoundError";
import { UserNotMemberOfGroupError } from "../../../../shared/exceptions/NotMemberGroupError";

import { GetGroupLeaderboardQuery } from "../../parameterObjects/GetGroupLeaderboardQuery";
import { GetGroupLeaderboardResponseDto } from "../../dtos/GroupResponse.dto";

import { GroupRepository } from "../../../domain/port/GroupRepository";
import { GroupId } from "../../../domain/valueObject/GroupId";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { GameProgressStatus } from "src/lib/singlePlayerGame/domain/valueObjects/SinglePlayerGameVOs";

export class GetGroupLeaderboardQueryHandler
  implements IHandler<GetGroupLeaderboardQuery, Either<DomainException, GetGroupLeaderboardResponseDto>>
{
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(query: GetGroupLeaderboardQuery): Promise<Either<DomainException, GetGroupLeaderboardResponseDto>> {
    
    const groupId = GroupId.of(query.groupId);
    const currentUserId = new UserId(query.currentUserId);

    const groupOptional = await this.groupRepository.findById(groupId);
    if (!groupOptional.hasValue()) {
      return Either.makeLeft(new GroupNotFoundError(query.groupId));
    }

    const group = groupOptional.getValue();

    const isMember = group.members.some(m => m.userId.value === currentUserId.value);
    if (!isMember) {
      return Either.makeLeft(new UserNotMemberOfGroupError(query.currentUserId, query.groupId));
    }


    // TODO: Idealmente mover esto a un Servicio de Dominio o ReadModel en el futuro
    const assignments = await this.groupRepository.findAssignmentsByGroupId(groupId);
    const assignedQuizIds = [...new Set(assignments.map(a => a.quizId))];

    // NOTA: Mantenemos el cast 'as any' porque StatisticsService no está implementado aún.
    const games = await (this.groupRepository as any).gameRepo.find({
      where: {
        quizId: assignedQuizIds, 
        status: GameProgressStatus.COMPLETED,
      },
      order: { completedAt: "DESC" },
    });

    const bestScoreByUserQuiz = new Map<string, number>();

    for (const g of games) {
      const key = `${g.playerId}|${g.quizId}`;
      const prev = bestScoreByUserQuiz.get(key);
      if (prev === undefined || g.score > prev) {
        bestScoreByUserQuiz.set(key, g.score);
      }
    }

    const totalPointsByUser = new Map<string, number>();
    for (const [key, score] of bestScoreByUserQuiz.entries()) {
      const userId = key.split("|")[0];
      totalPointsByUser.set(userId, (totalPointsByUser.get(userId) ?? 0) + score);
    }

    const plain = group.toPlainObject(); 
    const items = plain.members.map((m) => ({
      userId: m.userId,
      name: (m as any).name ?? (m as any).userName ?? m.userId,
      completedQuizzes: Number(m.completedQuizzes ?? 0),
      totalPoints: totalPointsByUser.get(m.userId) ?? 0,
      position: 0,
    }));

    items.sort((a, b) => {
      if (b.completedQuizzes !== a.completedQuizzes) {
        return b.completedQuizzes - a.completedQuizzes;
      }
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      return a.userId.localeCompare(b.userId);
    });

    items.forEach((x, i) => (x.position = i + 1));

    return Either.makeRight({ leaderboard: items });
  }
}