import { Inject } from "@nestjs/common";
import { IHandler } from "src/lib/shared/IHandler";
import { GetGroupQuizLeaderboardQuery } from "../../parameterObjects/GetGroupQuizLeaderboarQuery";
import { GetGroupQuizLeaderboardResponseDto } from "../../dtos/GroupResponse.dto";

import { GroupRepository } from "../../../domain/port/GroupRepository";
import { GroupId } from "../../../domain/valueObject/GroupId";
import { UserId as UserModuleId } from "src/lib/user/domain/valueObject/UserId"; 
import { UserId as KahootUserId } from "src/lib/kahoot/domain/valueObject/Quiz";

import { GroupNotFoundError } from "../../../../shared/exceptions/GroupNotFoundError";
import { UserNotMemberOfGroupError } from "../../../../shared/exceptions/NotMemberGroupError";
import { GameProgressStatus } from "src/lib/singlePlayerGame/domain/valueObjects/SinglePlayerGameVOs";
import { UserRepository } from "../../../../user/domain/port/UserRepository";

export class GetGroupQuizLeaderboardQueryHandler
  implements IHandler<GetGroupQuizLeaderboardQuery, GetGroupQuizLeaderboardResponseDto>
{
  constructor(
    private readonly groupRepository: GroupRepository,
    @Inject('SinglePlayerGameRepository') private readonly gameRepository: any,
    @Inject('UserRepository') private readonly userRepository: UserRepository 
  ) {}

  async execute(
    query: GetGroupQuizLeaderboardQuery,
  ): Promise<GetGroupQuizLeaderboardResponseDto> {

    const groupId = GroupId.of(query.groupId);
    const quizId = query.quizId;
    const currentUserId = new UserModuleId(query.currentUserId); 

    const groupOptional = await this.groupRepository.findById(groupId);
    if (!groupOptional.hasValue()) throw new GroupNotFoundError(groupId.value);

    const group = groupOptional.getValue();
    
    const isMember = group.members.some(
      (m) => m.userId.value === currentUserId.value,
    );
    if (!isMember) {
      throw new UserNotMemberOfGroupError(currentUserId.value, groupId.value);
    }
    
    const assignments = await this.groupRepository.findAssignmentsByGroupId(groupId);
    const isAssigned = assignments.some((a) => a.quizId === quizId);
    if (!isAssigned) {
      throw new Error("Quiz not assigned to this group");
    }

    const bestScoreByUser = new Map<string, number>();
    const userNamesMap = new Map<string, string>();

    for (const member of group.members) {
        const userOpt = await this.userRepository.getOneById(member.userId);
        let userName = "Usuario"; 
        
        if (userOpt) {
            const user = userOpt;
            userName = (user as any).username?.value || (user as any).username || (user as any).userName || (user as any).email?.value || member.userId.value;
        }
        userNamesMap.set(member.userId.value, userName);

        const memberKahootId = KahootUserId.of(member.userId.value);
        const memberGames = await this.gameRepository.findByPlayerId(memberKahootId);

        if (memberGames && memberGames.length > 0) {
            const validQuizGames = memberGames.filter((g: any) => {
                 const gQuizId = g.quizId?.value || g.quizId;
                 const gStatus = g.gameProgress?.status || g.status;
                 return gQuizId === quizId && 
                        (gStatus === 'COMPLETED' || gStatus === GameProgressStatus.COMPLETED);
            });

            for (const game of validQuizGames) {
                const actualScore = game.gameScore?.score ?? game.score ?? 0;
                const currentBest = bestScoreByUser.get(member.userId.value);
                
                if (currentBest === undefined || actualScore > currentBest) {
                    bestScoreByUser.set(member.userId.value, actualScore);
                }
            }
        }
    }

    const topPlayers = Array.from(bestScoreByUser.entries())
      .map(([userId, score]) => ({
        userId,
        name: userNamesMap.get(userId) || userId, 
        score,
      }))
      .sort((a, b) => b.score - a.score);

    return {
      quizId,
      groupId: groupId.value,
      topPlayers,
    };
  }
}