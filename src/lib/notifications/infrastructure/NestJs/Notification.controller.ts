import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  InternalServerErrorException,
  BadRequestException,
  Delete,
  Get,
  Query,
  Param,
  Patch,
  Inject,
  Headers,
} from '@nestjs/common';
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
import { MarkNotificationAsReadHandler } from '../../application/Handlers/command/MarkNotificationAsReadCommandHandler';
import { MarkNotificationAsReadCommand } from '../../application/parameterObjects/MarkNotificationAsReadCommand';
import { ITokenProvider } from "src/lib/auth/application/providers/ITokenProvider";


@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly registerDeviceHandler: RegisterDeviceCommandHandler,
    private readonly unregisterDeviceHandler: UnregisterDeviceCommandHandler,
    private readonly getNotificationsHandler: GetNotificationsQueryHandler,
    private readonly markNotificationAsReadHandler: MarkNotificationAsReadHandler,
    @Inject("ITokenProvider") 
    private readonly tokenProvider: ITokenProvider ,
  ) {}

  //Helpers

  private async getCurrentUserId(authHeader: string): Promise<string> {
    const token = authHeader?.replace(/^Bearer\s+/i, "");
    if (!token) {
      throw new Error("Token required");
    }
    const payload = await this.tokenProvider.validateToken(token);
    if (!payload || !payload.id) {
      throw new Error("Invalid token");
    }
    return payload.id;
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
    @Headers('authorization') authHeader: string 
  ) {
    const userId = await this.getCurrentUserId(authHeader);
    const command = new RegisterDeviceCommand(userId, body.token, body.deviceType);
    const result = await this.registerDeviceHandler.execute(command);
    return this.handleResult(result);
  }


  @Delete('unregister-device')
  @HttpCode(HttpStatus.NO_CONTENT) 
  async unregisterDevice(
    @Body() body: UnregisterDeviceDto,
    @Headers('authorization') authHeader: string 
  ) {
    const userId = await this.getCurrentUserId(authHeader);
    const command = new UnregisterDeviceCommand(userId, body.token);
    const result = await this.unregisterDeviceHandler.execute(command);
    this.handleResult(result);
  }

  @Get()
  async getNotifications(
    @Query('limit') limit: number = 20,
    @Query('page') page: number = 1,
    @Headers('authorization') authHeader: string 
  ) {
    const userId = await this.getCurrentUserId(authHeader);
    const query = new GetNotificationsQuery(userId, Number(limit), Number(page));
    const result = await this.getNotificationsHandler.execute(query);
    return this.handleResult(result);
  }

  @Patch(':id')
  async markAsRead(
    @Param('id') id: string,
    @Body() body: UpdateNotificationDto,
    @Headers('authorization') authHeader: string 
  ) {
    const userId = await this.getCurrentUserId(authHeader);
    const command = new MarkNotificationAsReadCommand(
      id, 
      userId, 
      body.isRead
    );
    const result = await this.markNotificationAsReadHandler.execute(command);    
    return this.handleResult(result);
  }
}