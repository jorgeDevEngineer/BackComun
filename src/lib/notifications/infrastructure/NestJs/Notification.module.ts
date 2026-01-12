import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from '../NestJs/Notification.controller'; // Ajusta la ruta si es necesario

import { RegisterDeviceCommandHandler } from '../../application/Handlers/command/RegisterDeviceCommandHandler';
import { UnregisterDeviceCommandHandler } from '../../application/Handlers/command/UnregisterDeviceCommandHandler';

import { DeviceEntity } from '../TypeOrm/NotificationOrmEntity';
import { TypeOrmDeviceRepository } from '../TypeOrm/TypeOrmNotificationDeviceRepository';

import { FirebaseNotifierAdapter } from '../Adapters/FirebaseNotifierAdapter';

import { NotificationEntity } from '../TypeOrm/NotificationEntity';
import { TypeOrmNotificationRepository } from '../TypeOrm/TyoeOrmNotificationRepository';
import { GetNotificationsQueryHandler } from '../../application/Handlers/queries/GetNotificationsQueryHandler';
import { QuizAssignedListener } from '../../application/EventListener/QuizAssignedListener';

export const DEVICE_REPOSITORY_TOKEN = 'IDeviceRepository';
export const PUSH_PROVIDER_TOKEN = 'IPushNotificationProvider';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceEntity, NotificationEntity]),
  ],
  controllers: [NotificationsController],
  providers: [
    RegisterDeviceCommandHandler,
    GetNotificationsQueryHandler,
    UnregisterDeviceCommandHandler,
    QuizAssignedListener,

    { provide: DEVICE_REPOSITORY_TOKEN, useClass: TypeOrmDeviceRepository },
    { provide: PUSH_PROVIDER_TOKEN, useClass: FirebaseNotifierAdapter },
    { provide: 'INotificationRepository', useClass: TypeOrmNotificationRepository },
  ],
  exports: [DEVICE_REPOSITORY_TOKEN, PUSH_PROVIDER_TOKEN],
})
export class NotificationsModule {}