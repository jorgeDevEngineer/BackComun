import { Body, Controller, Delete, Get, HttpCode, HttpException, Inject, Param, Post, Query } from '@nestjs/common';
import { UserIdDTO } from '../../application/DTOs/UserIdDTO';
import { AddUserFavoriteQuizService } from '../../application/Services/AddUserFavoriteQuizService';
import { DeleteUserFavoriteQuizService } from '../../application/Services/DeleteUserFavoriteQuizService';
import { GetAllUserQuizzesService } from '../../application/Services/GetAllUserQuizzesUseService';
import { GetUserFavoriteQuizzesService } from '../../application/Services/GetUserFavoriteQuizzesService';
import { QuizResponse } from '../../application/Response Types/QuizResponse';
import { QuizQueryParamsInput } from '../../application/DTOs/QuizQueryParamsDTO';
import { QueryResponse } from '../../application/Response Types/QueryResponse';
import { PlayingQuizResponse } from '../../application/Response Types/PlayingQuizResponse';
import { GetInProgressQuizzesService } from '../../application/Services/GetInProgessQuizzesService';
import { GetCompletedQuizzesService } from '../../application/Services/GetCompletedQuizzesService';

@Controller('library')
export class LibraryController {
   constructor(
       @Inject('AddUserFavoriteQuizService')
       private readonly addUserFavoriteQuizService: AddUserFavoriteQuizService,
       @Inject('DeleteUserFavoriteQuizService')
       private readonly deleteUserFavoriteQuizService: DeleteUserFavoriteQuizService,
       @Inject('GetUserFavoriteQuizzesService')
       private readonly getUserFavoriteQuizzesService: GetUserFavoriteQuizzesService,
       @Inject('GetAllUserQuizzesService')
       private readonly getAllUserQuizzesService: GetAllUserQuizzesService,
       @Inject('GetInProgressQuizzesService')
       private readonly getInProgressQuizzesService: GetInProgressQuizzesService,
       @Inject('GetCompletedQuizzesService')
       private readonly getCompletedQuizzesService: GetCompletedQuizzesService,
    ){}

    @Post('favorites/:quizId')
    @HttpCode(201)
    async addFavorite(@Param('quizId') quizId: string, @Body() dto: UserIdDTO): Promise<void> {
        const result = await this.addUserFavoriteQuizService.execute(dto, quizId);
        if(result.isLeft()){
            throw result.getLeft();
        }
        return result.getRight();
    }

    @Delete('favorites/:quizId')
    @HttpCode(204)
    async deleteFavorite(@Param('quizId') quizId: string, @Body() dto: UserIdDTO): Promise<void> {
        const result = await this.deleteUserFavoriteQuizService.execute(dto, quizId);
        if(result.isLeft()){
            throw result.getLeft();
        }
        return result.getRight();
    }

    @Get('favorites')
    @HttpCode(200)
    async getFavorites(@Body() dto: UserIdDTO, @Query() queryParams: QuizQueryParamsInput): Promise<QueryResponse<QuizResponse>> {
        const result = await this.getUserFavoriteQuizzesService.execute(dto, queryParams);
        if(result.isLeft()){
            throw result.getLeft();
        }
        return result.getRight();
    }

    @Get('my-creations')
    @HttpCode(200)
    async getMyCreations(@Body() dto: UserIdDTO, @Query() queryParams: QuizQueryParamsInput): Promise<QueryResponse<QuizResponse>> {
        const result = await this.getAllUserQuizzesService.execute(dto, queryParams);
        if(result.isLeft()){
            throw result.getLeft();
        }
        return result.getRight();
    }
    
    @Get('in-progress')
    @HttpCode(200)
    async getInProgressQuizzes(@Body() dto: UserIdDTO, @Query() queryParams: QuizQueryParamsInput): Promise<QueryResponse<PlayingQuizResponse>> {
       const result = await this.getInProgressQuizzesService.execute(dto, queryParams);
       if(result.isLeft()){
         throw result.getLeft();
       }
       return result.getRight();
    }

    @Get('completed')
    @HttpCode(200)
    async getCompletedQuizzes(@Body() dto: UserIdDTO, @Query() queryParams: QuizQueryParamsInput): Promise<QueryResponse<PlayingQuizResponse>> {
       const result = await this.getCompletedQuizzesService.execute(dto, queryParams);
       if(result.isLeft()){
         throw result.getLeft();
       }
       return result.getRight();
    }

}