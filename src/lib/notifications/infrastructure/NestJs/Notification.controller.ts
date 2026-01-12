import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  InternalServerErrorException,
  BadRequestException,
  Delete,
  Get,
  Query,
  Param,
  Patch,
} from '@nestjs/common';
import { Request } from 'express';
import { FakeCurrentUserGuard } from '../../../groups/infraestructure/NestJs/FakeCurrentUser.guard';
import { RegisterDeviceResponseDto, UnregisterDeviceDto } from '../../application/dtos/NotificationsResponse.dto';
import { UpdateNotificationDto } from '../../application/dtos/NotificationsResponse.dto';
import { RegisterDeviceCommand } from '../../application/parameterObjects/RegisterDeviceCommand';
import { UnregisterDeviceCommand } from '../../application/parameterObjects/UnregisterDeviceCommand'; 
import { RegisterDeviceCommandHandler } from '../../application/Handlers/command/RegisterDeviceCommandHandler';
import { UnregisterDeviceCommandHandler } from '../../application/Handlers/command/UnregisterDeviceCommandHandler'; 
import { GetNotificationsQuery } from '../../application/parameterObjects/GetNotificationsQuery';
import { GetNotificationsQueryHandler } from '../../application/Handlers/queries/GetNotificationsQueryHandler';
import { Either } from 'src/lib/shared/Type Helpers/Either';
import { DomainException } from 'src/lib/shared/exceptions/DomainException';
import { NotificationBusinessException } from '../../../shared/exceptions/NotificationBussinesException';

@Controller('notifications')
@UseGuards(FakeCurrentUserGuard)
export class NotificationsController {
  constructor(
    private readonly registerDeviceHandler: RegisterDeviceCommandHandler,
    private readonly unregisterDeviceHandler: UnregisterDeviceCommandHandler,
    private readonly getNotificationsHandler: GetNotificationsQueryHandler,
  ) {}

  //Helpers

  private getCurrentUserId(req: Request): string {
    const user = (req as any).user;
    if (!user?.id) {
      throw new InternalServerErrorException('User ID missing in request context');
    }
    return user.id;
  }

  private handleResult<T>(result: Either<DomainException, T>): T {
    if (result.isLeft()) {
      const error = result.getLeft();
    if (error instanceof NotificationBusinessException) {
      throw new BadRequestException(error.message);
    }
      throw new InternalServerErrorException(error.message);
    }
    return result.getRight();
  }

  // Endpoints
  @Post('register-device')
  @HttpCode(HttpStatus.CREATED)
  async registerDevice(
    @Body() body: RegisterDeviceResponseDto,
    @Req() req: Request,
  ) {
    const userId = this.getCurrentUserId(req);
    const command = new RegisterDeviceCommand(userId, body.token, body.deviceType);
    const result = await this.registerDeviceHandler.execute(command);
    return this.handleResult(result);
  }


  @Delete('unregister-device')
  @HttpCode(HttpStatus.NO_CONTENT) 
  async unregisterDevice(
    @Body() body: UnregisterDeviceDto,
    @Req() req: Request,
  ) {
    const userId = this.getCurrentUserId(req);
    const command = new UnregisterDeviceCommand(userId, body.token);
    const result = await this.unregisterDeviceHandler.execute(command);
    this.handleResult(result);
  }

  @Get()
  async getNotifications(
    @Query('limit') limit: number = 20,
    @Query('page') page: number = 1,
    @Req() req: Request,
  ) {
    const userId = this.getCurrentUserId(req);
    const query = new GetNotificationsQuery(userId, Number(limit), Number(page));
    const result = await this.getNotificationsHandler.execute(query);
    return this.handleResult(result);
  }

  @Patch(':id')
  async markAsRead(
    @Param('id') id: string,
    @Body() body: UpdateNotificationDto,
    @Req() req: Request,
  ) {
    // TODO: Implementar MarkAsReadHandler
  }
}