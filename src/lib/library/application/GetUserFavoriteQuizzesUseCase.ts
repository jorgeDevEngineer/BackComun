import {QueryParamsDto, QueryParamsInput} from "./DTOs/QueryParamsDTO";
import {UserFavoriteQuizRepository} from "../domain/port/UserFavoriteQuizRepository";
import {QuizRepository} from "../domain/port/QuizRepository";
import {QuizId } from "../../kahoot/domain/valueObject/Quiz";
import { Quiz } from "../../kahoot/domain/entity/Quiz";
import { QuizResponse, toQuizResponse} from "./QuizResponse";
import { UserRepository } from "src/lib/user/domain/port/UserRepository";
import { User } from "src/lib/user/domain/entity/User";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { CriteriaApplier } from "../domain/port/CriteriaApplier";
import { SelectQueryBuilder } from "typeorm";

export class GetUserFavoriteQuizzesUseCase {
  constructor(private readonly favoritesRepo: UserFavoriteQuizRepository, 
    private readonly quizRepo: QuizRepository,
    private readonly userRepo: UserRepository
  ) {}

  async execute(userId: string, queryInput: QueryParamsInput) {
    const query = new QueryParamsDto(queryInput);
    const criteria = query.toCriteria();
    const [favoriteIds, totalCount] = await this.favoritesRepo.findFavoritesQuizByUser(
      new UserId(userId),
      criteria,
    );

    if (favoriteIds.length === 0) {
      return {
        data: [],
        pagination: {
          page: criteria.page,
          limit: criteria.limit,
          totalCount: 0,
          totalPages: 0,
        },
      };
    }

    // 2. Traer quizzes completos y autores
    const data: QuizResponse[] = [];
    for (const quizId of favoriteIds) {
      const quiz = await this.quizRepo.find(quizId); // devuelve entidad de dominio Quiz
      const author = await this.userRepo.getOneById(new UserId(quiz.authorId.value));
      data.push(toQuizResponse(quiz, author));
    }

    return {
      data,
      pagination: {
        page: criteria.page,
        limit: criteria.limit,
        totalCount,
        totalPages: Math.ceil(totalCount / criteria.limit),
      }
    };
  }
}