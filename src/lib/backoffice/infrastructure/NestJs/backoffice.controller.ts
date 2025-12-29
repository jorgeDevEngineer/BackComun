import {
    Controller,
    DefaultValuePipe,
    Get,
    InternalServerErrorException,
    NotFoundException,
    Param,
    Patch,
    Query,
  } from '@nestjs/common';
  import { IsString, Length } from 'class-validator';
  import { SearchUsersUseCase } from '../../application/SearchUsersUseCase';
  import { BlockUserUseCase } from '../../application/BlockUserUseCase';


export class FindOneParams {
    @IsString()
    @Length(5, 255)
    id: string;
 }

@Controller('')
export class BackofficeController {
    constructor(
        private readonly searchUsersUseCase: SearchUsersUseCase,
        private readonly blockUserUseCase: BlockUserUseCase,
    ){}

    @Get('users')
    async searchUser(
        @Query('q') q?: string,
        @Query('limit', new DefaultValuePipe(10)) limit?: number,
        @Query('page', new DefaultValuePipe(1)) page?: number,
        @Query('orderBy', new DefaultValuePipe('createdAt')) orderBy?: string,
        @Query('order', new DefaultValuePipe('desc')) order: 'asc' | 'desc' = 'desc'
    ) {
        try {

            const result = await this.searchUsersUseCase.run({ 
                q, 
                limit, 
                page, 
                orderBy, 
                order 
            });
            
            return result;
        } catch (e) {
            throw new InternalServerErrorException(e.message);
        }
    }

    @Patch('users/:userId')
    async blockUser(
        @Param('userId') userId: string,
    ) {
        try {
            const result = await this.blockUserUseCase.run(userId);
            return result;
        } catch (e) {
            throw new Error(e.message);
        }
    }
}