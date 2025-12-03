import {QueryParamsDto, QueryParamsInput} from "./DTOs/QueryParamsDTO";
import {UserFavoriteQuizRepository} from "../domain/port/UserFavoriteQuizRepository";
import {QuizRepository} from "../domain/port/QuizRepository";
import {QuizId } from "../../kahoot/domain/valueObject/Quiz";
import { Quiz } from "../../kahoot/domain/entity/Quiz";
import { QuizResponse, toQuizResponse} from "./QuizResponse";
import { UserRepository } from "src/lib/user/domain/port/UserRepository";
import { User } from "src/lib/user/domain/entity/User";
import { UserId } from "src/lib/user/domain/valueObject/UserId";

export class GetUserFavoriteQuizzesUseCase {
  constructor(private readonly favoritesRepo: UserFavoriteQuizRepository, 
    private readonly quizRepo: QuizRepository,
    private readonly userRepo: UserRepository
  ) {}

  async execute(userId: string /*queryInput: QueryParamsInput*/) {
    let quizFinded: Quiz[] = [];
    let quizzesAuthor: User[] = [];
    let data: QuizResponse[] = [];
    //const query = new QueryParamsDto(queryInput);
    //const criteria = query.toCriteria();
    const favoriteIds:QuizId[] = await this.favoritesRepo.findFavoritesQuizByUser(new UserId(userId));
    if (favoriteIds.length === 0) {
      return {
        data: []
        /*pagination: {
          page: criteria.page,
          limit: criteria.limit,
          totalCount: 0,
          totalPages: 0,
        },*/
      };
    }
    

    let dataElement: Quiz;
    let quizAuthor: User;
    for(const quizId of favoriteIds){
      dataElement = await this.quizRepo.find(quizId);
      quizAuthor = await this.userRepo.getOneById(new UserId(dataElement.authorId.value));
      quizFinded.push(dataElement);
      quizzesAuthor.push(quizAuthor);
    }

    console.log(quizFinded);
    console.log(quizzesAuthor);

    for(let i=0; i<quizFinded.length; i++){
      data[i] = toQuizResponse(quizFinded[i], quizzesAuthor[i]);
    }

    return {
      data: data
      /*pagination: {
        page: criteria.page,
        limit: criteria.limit,
        totalCount,
        totalPages: Math.ceil(totalCount / criteria.limit),
      },*/
    };
  }
}