import {
    Controller,
    DefaultValuePipe,
    Get,
    InternalServerErrorException,
    NotFoundException,
    Param,
    Patch,
    Query,
    Headers,
    Delete,
    Post,
    Body,
    BadRequestException,
  } from '@nestjs/common';
  import { SearchUsersUseCase } from '../../application/SearchUsersUseCase';
  import { BlockUserUseCase } from '../../application/BlockUserUseCase';
  import { UnblockUserUseCase } from '../../application/UnblockUserUseCase';
  import { DeleteUserUseCase } from '../../application/DeleteUserUseCase';
  import { GiveAdminRoleUseCase } from '../../application/GiveAdminUseCase';
  import { RemoveAdminRoleUseCase } from '../../application/RemoveAdminUseCase';
  import { SendNotificationUseCase } from '../../application/SendNotificationUseCase';
  import { GetNotificationsUseCase } from '../../application/GetNotificationUseCase';
  



@Controller('backoffice')
export class BackofficeController {
    constructor(
        private readonly searchUsersUseCase: SearchUsersUseCase,
        private readonly blockUserUseCase: BlockUserUseCase,
        private readonly deleteUserUseCase: DeleteUserUseCase,
        private readonly sendNotificationUseCase: SendNotificationUseCase,
        private readonly UnblockUserUseCase: UnblockUserUseCase,
        private readonly giveAdminRoleUseCase: GiveAdminRoleUseCase,
        private readonly removeAdminRoleUseCase: RemoveAdminRoleUseCase,
        private readonly getNotificationsUseCase: GetNotificationsUseCase,
    ){}

    @Get('users')
    async searchUser(
        @Headers('authorization') auth: string,
        @Query('q') q?: string,
        @Query('limit', new DefaultValuePipe(10)) limit?: number,
        @Query('page', new DefaultValuePipe(1)) page?: number,
        @Query('orderBy', new DefaultValuePipe('createdAt')) orderBy?: string,
        @Query('order', new DefaultValuePipe('desc')) order: 'asc' | 'desc' = 'desc'
    ) {
        try {
            const result = await this.searchUsersUseCase.run(auth, { 
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

    @Patch('blockUser/:userId')
    async blockUser(
        @Headers('authorization') auth: string,
        @Param('userId') userId: string,
    ) {
        try {
            const result = await this.blockUserUseCase.run(auth, userId);
            return result;
        } catch (e) {
            throw new InternalServerErrorException(e.message);
        }
    }

    @Patch('unblockUser/:userId')
    async unblockUser(
        @Headers('authorization') auth: string,
        @Param('userId') userId: string,
    ) {
        try {
            const result = await this.UnblockUserUseCase.run(auth, userId);
            return result;
        } catch (e) {
            throw new InternalServerErrorException(e.message);
        }
    }

    @Delete('user/:userId')
    async deleteUser(
        @Headers('authorization') auth: string,
        @Param('userId') userId: string,
    ) {
        try {
            const result = await this.deleteUserUseCase.run(auth, userId);
            return result;
        } catch (e) {
            throw new InternalServerErrorException(e.message);
        }
    }

    @Patch('giveAdmin/:userId')
    async giveAdminRole(
        @Headers('authorization') auth: string,
        @Param('userId') userId: string,
    ) {
        try {
            const result = await this.giveAdminRoleUseCase.run(auth, userId);
            return result;
        } catch (e) {
            throw new InternalServerErrorException(e.message);
        }
    }

    @Patch('removeAdmin/:userId')
    async removeAdminRole(
        @Headers('authorization') auth: string,
        @Param('userId') userId: string,
    ) {
        try {
            const result = await this.removeAdminRoleUseCase.run(auth, userId);
            return result;
        } catch (e) {
            throw new InternalServerErrorException(e.message);
        }
    }

    @Post('massNotifications')
    async sendNotification(
        @Headers('authorization') auth: string,
        @Body() body: {
            title: string;
            message: string;
            filters: {
                toAdmins: boolean,
                toRegularUsers: boolean
            }
        },
    ) {
        try {
            const result = await this.sendNotificationUseCase.run(auth, {
                title: body.title,
                message: body.message,
                filters: body.filters,
            });
            return result;
        } catch (e) {
            throw new BadRequestException(e.message);
        }
    }

    @Get('massNotifications')
    async getNotifications(
        @Headers('authorization') auth: string,
        @Query('userId') userId?: string,
        @Query('limit', new DefaultValuePipe(10)) limit?: number,
        @Query('page', new DefaultValuePipe(1)) page?: number,
        @Query('orderBy', new DefaultValuePipe('createdAt')) orderBy?: string,
        @Query('order', new DefaultValuePipe('desc')) order: 'asc' | 'desc' = 'desc'
    ) {
        try {
            const result = await this.getNotificationsUseCase.run(auth, {
                userId,
                limit,
                page,
                orderBy,
                order,
            });
            return result;
        } catch (e) {
            throw new InternalServerErrorException(e.message);
        }
    }
}