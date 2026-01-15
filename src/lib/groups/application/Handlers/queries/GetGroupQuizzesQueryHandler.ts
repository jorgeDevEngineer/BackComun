import { Inject } from "@nestjs/common";
import { IHandler } from "src/lib/shared/IHandler";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { GroupNotFoundError } from "src/lib/shared/exceptions/GroupNotFoundError";
import { UserNotMemberOfGroupError } from "../../../../shared/exceptions/NotMemberGroupError";

import { GetGroupQuizzesQuery } from "../../parameterObjects/GetGroupQuizzesQuery";
import { GetGroupAssignedQuizzesResponseDto } from "../../dtos/GroupResponse.dto";

import { GroupRepository } from "../../../domain/port/GroupRepository";
import { GroupId } from "../../../domain/valueObject/GroupId";
import { GameProgressStatus } from "src/lib/singlePlayerGame/domain/valueObjects/SinglePlayerGameVOs";
import { QuizRepository } from "../../../../kahoot/domain/port/QuizRepository"
import { QuizId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { SinglePlayerGameRepository } from "src/lib/singlePlayerGame/domain/repositories/SinglePlayerGameRepository";
import { UserId as UserModuleId } from "src/lib/user/domain/valueObject/UserId";

import { UserId as KahootUserId } from "src/lib/kahoot/domain/valueObject/Quiz";


export class GetGroupQuizzesQueryHandler
  implements IHandler<GetGroupQuizzesQuery, Either<DomainException, GetGroupAssignedQuizzesResponseDto>>
{
  constructor(
    private readonly groupRepository: GroupRepository,
    @Inject('QuizRepository') private readonly quizRepository: QuizRepository,
    @Inject('SinglePlayerGameRepository') private readonly gameRepository: SinglePlayerGameRepository 

  ) {}

  async execute(query: GetGroupQuizzesQuery): Promise<Either<DomainException, GetGroupAssignedQuizzesResponseDto>> {
    
    const groupId = GroupId.of(query.groupId);
    const currentUserId = new UserModuleId(query.currentUserId);

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
   
    const quizTitleMap = new Map<string, string>();
    if (quizIds.length > 0) {
      for (const qIdStr of quizIds) {
        const qId = QuizId.of(qIdStr);
        const quiz = await this.quizRepository.find(qId);
          if (quiz) {
      quizTitleMap.set(qIdStr, quiz.getTitle());
      }
    }
    }
const idParaElRepo = KahootUserId.of(currentUserId.value);
 const allPlayerGames = await this.gameRepository.findCompletedGames(idParaElRepo);

const completedAttempts = allPlayerGames.filter((game) => {
   const gameQuizIdString = game.getQuizId().value
   const isFromGroupQuiz = quizIds.includes(gameQuizIdString);
    const isCompleted = game.isComplete() === true; 
    return isFromGroupQuiz && isCompleted;
});

completedAttempts.sort((a: any, b: any) => {
    return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
});

let allGroupAttempts: any[] = []; 

if (quizIds.length > 0) {
      for (const member of group.members) {

        const memberKahootId = KahootUserId.of(member.userId.value);
        const memberGames = await this.gameRepository.findByPlayerId(memberKahootId);
        
        if(memberGames && memberGames.length > 0) {
            allGroupAttempts.push(...memberGames);
        }
      }
    }

    const data = assignments.map(a => {
      const effectiveAssignedAt = a.availableFrom ?? a.createdAt;

      const attemptsForThisQuiz = allGroupAttempts.filter((at: any) => {

        const qId = at.quizId?.value || at.quizId; 
          const status = at.gameProgress?.status || at.status;
          const attemptDate = new Date(at.startedAt);
          const isQuizMatch = qId === a.quizId;
          const isStatusMatch = (status === 'COMPLETED' || status === GameProgressStatus.COMPLETED);
          const isDateMatch = attemptDate.getTime() >= effectiveAssignedAt.getTime();

          return isQuizMatch && isStatusMatch && isDateMatch;
      });

      const leaderboardAttempts = [...attemptsForThisQuiz].sort((x: any, y: any) => {
          const scoreX = x.gameScore?.score ?? x.score ?? 0;
          const scoreY = y.gameScore?.score ?? y.score ?? 0;
          return scoreY - scoreX;
      });

      const leaderboard = leaderboardAttempts.slice(0, 5).map((at: any) => ({
          name: at.playerId?.value || at.playerId, 
          score: at.gameScore?.score ?? at.score ?? 0
      }));

      const myAttempts = attemptsForThisQuiz.filter((at: any) => {
          const pId = at.playerId?.value || at.playerId;
          return pId === currentUserId.value;
      });
      
      myAttempts.sort((x: any, y: any) => new Date(x.startedAt).getTime() - new Date(y.startedAt).getTime());

      const myFirstValidAttempt = myAttempts[0];
      const status: "PENDING" | "COMPLETED" = myFirstValidAttempt ? "COMPLETED" : "PENDING";

      let userResult = null;
      if (myFirstValidAttempt) {
          userResult = {
             score: myFirstValidAttempt.gameScore?.score ?? myFirstValidAttempt.score ?? 0,
             attemptId: myFirstValidAttempt.gameId?.gameId || myFirstValidAttempt.gameId || myFirstValidAttempt.id,
             completedAt: myFirstValidAttempt.completedAt?.value || myFirstValidAttempt.completedAt
          };
      }

      return {
        assignmentId: a.id,
        quizId: a.quizId,
        title: quizTitleMap.get(a.quizId) ?? "Quiz sin título",
        availableUntil: a.availableUntil ?? null,
        status,
        userResult,
        leaderboard, 
      };
    });

    return Either.makeRight({ data });
  }
}