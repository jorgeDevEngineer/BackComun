import { Inject } from "@nestjs/common";
import { IHandler } from "src/lib/shared/IHandler";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { GroupNotFoundError } from "src/lib/shared/exceptions/GroupNotFoundError";
import { UserNotMemberOfGroupError } from "../../../../shared/exceptions/NotMemberGroupError";

import { GetGroupLeaderboardQuery } from "../../parameterObjects/GetGroupLeaderboardQuery";
import { GetGroupLeaderboardResponseDto } from "../../dtos/GroupResponse.dto";

import { GroupRepository } from "../../../domain/port/GroupRepository";
import { GroupId } from "../../../domain/valueObject/GroupId";
import { GameProgressStatus } from "src/lib/singlePlayerGame/domain/valueObjects/SinglePlayerGameVOs";

import { UserRepository } from "../../../../user/domain/port/UserRepository";
import { UserId as UserModuleId } from "src/lib/user/domain/valueObject/UserId"; 
import { UserId as KahootUserId } from "src/lib/kahoot/domain/valueObject/Quiz";

export class GetGroupLeaderboardQueryHandler
  implements IHandler<GetGroupLeaderboardQuery, Either<DomainException, GetGroupLeaderboardResponseDto[]>>
{
  constructor(
    private readonly groupRepository: GroupRepository,
    @Inject('SinglePlayerGameRepository') private readonly gameRepository: any,
    @Inject('UserRepository') private readonly userRepository: UserRepository 
  ) {}

  async execute(query: GetGroupLeaderboardQuery): Promise<Either<DomainException, GetGroupLeaderboardResponseDto[]>> {
    
    const groupId = GroupId.of(query.groupId);
    const currentUserId = new UserModuleId(query.currentUserId);
    const groupOptional = await this.groupRepository.findById(groupId);

    if (!groupOptional.hasValue()) {
      return Either.makeLeft(new GroupNotFoundError(query.groupId));
    }
    const group = groupOptional.getValue();

    const isMember = group.members.some(m => m.userId.value === currentUserId.value);
    if (!isMember) {
      return Either.makeLeft(new UserNotMemberOfGroupError(query.currentUserId, query.groupId));
    }

    const assignments = await this.groupRepository.findAssignmentsByGroupId(groupId);
    const assignedQuizIds = [...new Set(assignments.map(a => a.quizId))]; 
    const bestScoreByUserQuiz = new Map<string, number>();
    const userNamesMap = new Map<string, string>();

    for (const member of group.members) {
        const userOpt = await this.userRepository.getOneById(member.userId);
        let userName = "Usuario Desconocido";
        
        if (userOpt) {
            const user = userOpt;
            userName = user.userName.value ? (user.userName['value'] || user.userName.value) : user.email.value; 
        }
        userNamesMap.set(member.userId.value, userName);

        const memberKahootId = KahootUserId.of(member.userId.value);
        const memberGames = await this.gameRepository.findByPlayerId(memberKahootId);

        if (memberGames && memberGames.length > 0) {
            for (const game of memberGames) {
                const gQuizId = game.quizId?.value || game.quizId;
                const gStatus = game.gameProgress?.status || game.status;
                const gScore = game.gameScore?.score ?? game.score ?? 0;

                const isAssignedQuiz = assignedQuizIds.includes(gQuizId);
                const isCompleted = (gStatus === 'COMPLETED' || gStatus === GameProgressStatus.COMPLETED);

                if (isAssignedQuiz && isCompleted) {
                    const key = `${member.userId.value}|${gQuizId}`;
                    const prev = bestScoreByUserQuiz.get(key);
                    if (prev === undefined || gScore > prev) {
                        bestScoreByUserQuiz.set(key, gScore);
                    }
                }
            }
        }
    }

    const totalPointsByUser = new Map<string, number>();
    for (const [key, score] of bestScoreByUserQuiz.entries()) {
      const userId = key.split("|")[0]; 
      const currentTotal = totalPointsByUser.get(userId) ?? 0;
      totalPointsByUser.set(userId, currentTotal + score);
    }

    const plain = group.toPlainObject(); 
    const items: GetGroupLeaderboardResponseDto[] = plain.members.map((m) =>{
      return{
        userId: m.userId,
        name: userNamesMap.get(m.userId) || m.userId, 
        completedQuizzes: Number(m.completedQuizzes ?? 0),
        totalPoints: totalPointsByUser.get(m.userId) ?? 0,
        position: 0,
      }
    });

    // Ordenar
    items.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      if (b.completedQuizzes !== a.completedQuizzes) {
        return b.completedQuizzes - a.completedQuizzes;
      }
      return a.userId.localeCompare(b.userId);
    });

    items.forEach((x, i) => (x.position = i + 1));

    return Either.makeRight(items );
  }
}