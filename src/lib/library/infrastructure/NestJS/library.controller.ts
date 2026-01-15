import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Headers,
  Post,
  Query,
  UnauthorizedException,
} from "@nestjs/common";
import { QuizResponse } from "../../application/Response Types/QuizResponse";
import { QuizQueryParamsInput } from "../DTOs/QuizQueryParamsDTO";
import { QueryWithPaginationResponse } from "../../application/Response Types/QueryWithPaginationResponse";
import { PlayingQuizResponse } from "../../application/Response Types/PlayingQuizResponse";
import { DeleteUserFavoriteQuiz } from "../../application/Parameter Objects/DeleteUserFavoriteQuiz";
import { AddUserFavoriteQuiz } from "../../application/Parameter Objects/AddUserFavoriteQuiz";
import { GetUserQuizzes } from "../../application/Parameter Objects/GetUserQuizzes";
import { IHandler } from "../../../shared/IHandler";
import { DomainException } from "../../../shared/exceptions/DomainException";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { ITokenProvider } from "src/lib/auth/application/providers/ITokenProvider";

@Controller("library")
export class LibraryController {
  constructor(
    @Inject("ITokenProvider") private readonly tokenProvider: ITokenProvider,
    @Inject("AddUserFavoriteQuizCommandHandler")
    private readonly addUserFavoriteQuizHandler: IHandler<
      AddUserFavoriteQuiz,
      Either<DomainException, void>
    >,
    @Inject("DeleteUserFavoriteQuizCommandHandler")
    private readonly deleteUserFavoriteQuizHandler: IHandler<
      DeleteUserFavoriteQuiz,
      Either<DomainException, void>
    >,
    @Inject("GetUserFavoriteQuizzesQueryHandler")
    private readonly getUserFavoriteQuizzesHandler: IHandler<
      GetUserQuizzes,
      Either<DomainException, QueryWithPaginationResponse<QuizResponse>>
    >,
    @Inject("GetAllUserQuizzesQueryHandler")
    private readonly getAllUserQuizzesHandler: IHandler<
      GetUserQuizzes,
      Either<DomainException, QueryWithPaginationResponse<QuizResponse>>
    >,
    @Inject("GetUserInProgressQuizzesQueryHandler")
    private readonly getInProgressQuizzesHandler: IHandler<
      GetUserQuizzes,
      Either<DomainException, QueryWithPaginationResponse<PlayingQuizResponse>>
    >,
    @Inject("GetUserCompletedQuizzesQueryHandler")
    private readonly getCompletedQuizzesHandler: IHandler<
      GetUserQuizzes,
      Either<DomainException, QueryWithPaginationResponse<PlayingQuizResponse>>
    >
  ) {}

  private async getCurrentUserId(authHeader: string): Promise<string> {
    const token = authHeader?.replace(/^Bearer\s+/i, "");
    if (!token) {
      throw new UnauthorizedException("Token required");
    }
    const payload = await this.tokenProvider.validateToken(token);
    if (!payload || !payload.id) {
      throw new UnauthorizedException("Invalid token");
    }
    return payload.id;
  }

  @Post("favorites/:quizId")
  @HttpCode(201)
  async addFavorite(
    @Param("quizId") quizId: string,
    @Headers("authorization") auth: string
  ): Promise<void> {
    const userId = await this.getCurrentUserId(auth);
    const command = new AddUserFavoriteQuiz(userId, quizId);
    const result = await this.addUserFavoriteQuizHandler.execute(command);
    if (result.isLeft()) {
      throw result.getLeft();
    }
    return result.getRight();
  }

  @Delete("favorites/:quizId")
  @HttpCode(204)
  async deleteFavorite(
    @Param("quizId") quizId: string,
    @Headers("authorization") auth: string
  ): Promise<void> {
    const userId = await this.getCurrentUserId(auth);
    const command = new DeleteUserFavoriteQuiz(userId, quizId);
    const result = await this.deleteUserFavoriteQuizHandler.execute(command);
    if (result.isLeft()) {
      throw result.getLeft();
    }
    return result.getRight();
  }

  @Get("favorites")
  @HttpCode(200)
  async getFavorites(
    @Headers("authorization") auth: string,
    @Query() queryParams: QuizQueryParamsInput
  ): Promise<QueryWithPaginationResponse<QuizResponse>> {
    const userId = await this.getCurrentUserId(auth);
    const command = new GetUserQuizzes(userId, queryParams);
    const result = await this.getUserFavoriteQuizzesHandler.execute(command);
    if (result.isLeft()) {
      throw result.getLeft();
    }
    return result.getRight();
  }

  @Get("my-creations")
  @HttpCode(200)
  async getMyCreations(
    @Headers("authorization") auth: string,
    @Query() queryParams: QuizQueryParamsInput
  ): Promise<QueryWithPaginationResponse<QuizResponse>> {
    const userId = await this.getCurrentUserId(auth);
    const command = new GetUserQuizzes(userId, queryParams);
    const result = await this.getAllUserQuizzesHandler.execute(command);
    if (result.isLeft()) {
      throw result.getLeft();
    }
    return result.getRight();
  }

  @Get("in-progress")
  @HttpCode(200)
  async getInProgressQuizzes(
    @Headers("authorization") auth: string,
    @Query() queryParams: QuizQueryParamsInput
  ): Promise<QueryWithPaginationResponse<PlayingQuizResponse>> {
    const userId = await this.getCurrentUserId(auth);
    const command = new GetUserQuizzes(userId, queryParams);
    const result = await this.getInProgressQuizzesHandler.execute(command);
    if (result.isLeft()) {
      throw result.getLeft();
    }
    return result.getRight();
  }

  @Get("completed")
  @HttpCode(200)
  async getCompletedQuizzes(
    @Headers("authorization") auth: string,
    @Query() queryParams: QuizQueryParamsInput
  ): Promise<QueryWithPaginationResponse<PlayingQuizResponse>> {
    const userId = await this.getCurrentUserId(auth);
    console.log(userId);
    const command = new GetUserQuizzes(userId, queryParams);
    const result = await this.getCompletedQuizzesHandler.execute(command);
    if (result.isLeft()) {
      throw result.getLeft();
    }
    return result.getRight();
  }
}
