import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post } from '@nestjs/common';
import { FavoriteDTO } from '../../application/DTOs/FavoriteDTO';
import { AddUserFavoriteQuizUseCase } from '../../application/AddUserFavoriteQuizUseCase';
import { DeleteUserFavoriteQuizUseCase } from '../../application/DeleteUserFavoriteQuizUseCase';
import { In } from 'typeorm';
import { GetUserFavoriteQuizzesUseCase } from '../../application/GetUserFavoriteQuizzesUseCase';

@Controller('library')
export class LibraryController {
   constructor(
       @Inject('AddUserFavoriteQuizUseCase')
       private readonly addUserFavoriteQuizUseCase: AddUserFavoriteQuizUseCase,
       @Inject('DeleteUserFavoriteQuizUseCase')
       private readonly deleteUserFavoriteQuizUseCase: DeleteUserFavoriteQuizUseCase,
       @Inject('GetUserFavoriteQuizzesUseCase')
       private readonly getUserFavoriteQuizzesUseCase: GetUserFavoriteQuizzesUseCase,
    ){}

    @Post('favorites/:quizId')
    @HttpCode(201)
    async addFavorite(@Param('quizId') quizId: string, @Body() dto: FavoriteDTO): Promise<void> {
        const result = await this.addUserFavoriteQuizUseCase.run(dto, quizId);
        if(result.isLeft()){
            throw result.getLeft();
        }
        return result.getRight();
    }

    @Delete('favorites/:quizId')
    @HttpCode(204)
    async deleteFavorite(@Param('quizId') quizId: string, @Body() dto: FavoriteDTO): Promise<void> {
        const result = await this.deleteUserFavoriteQuizUseCase.run(dto, quizId);
        if(result.isLeft()){
            throw result.getLeft();
        }
        return result.getRight();
    }

    @Get('favorites')
    @HttpCode(200)
    async getFavorites(@Body() dto: FavoriteDTO): Promise<any> {
        const result = await this.getUserFavoriteQuizzesUseCase.execute(dto.userId);
        return result;
    }
}