import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { QuizAssignedToGroupEvent } from '../../../shared/domain/Events/QuizAssignedToGroupEvent';
import { IDeviceRepository } from '../../domain/port/IDeviceRepository';
import { INotificationRepository } from '../../domain/port/INotificationRepository';
import { IPushNotificationProvider } from '../../domain/port/IPushNotificationProvider';
import { NotificationEntity } from '../../infrastructure/TypeOrm/NotificationEntity';
import { UserId } from 'src/lib/user/domain/valueObject/UserId';
import { randomUUID } from 'crypto';

@Injectable()
export class QuizAssignedListener {
  private readonly logger = new Logger(QuizAssignedListener.name);

  constructor(
    @Inject('IDeviceRepository') private readonly deviceRepo: IDeviceRepository,
    @Inject('INotificationRepository') private readonly notificationRepo: INotificationRepository,
    @Inject('IPushNotificationProvider') private readonly pushProvider: IPushNotificationProvider,
  ) {}

  @OnEvent('quiz.assigned')
  async handleQuizAssigned(event: QuizAssignedToGroupEvent) { 
    this.logger.log(`Evento: ${event.assignerName} asignó "${event.quizTitle}" en ${event.groupName}`);

    const title = `Nuevo Quiz: ${event.quizTitle}`;// arreglar esto
    const body = `${event.assignerName} ha asignado un nuevo quiz en el grupo ${event.groupName}. ¡Juégalo antes de que venza!`;

    for (const userId of event.memberIds) {
      
      const notification = new NotificationEntity();
      notification.id = randomUUID();
      notification.userId = userId;
      notification.type = 'quiz_assigned'; 
      notification.title = title;
      notification.body = body;
      notification.isRead = false;
      notification.resourceId = event.quizId; // ID para que al tocar, vaya al quiz
      notification.createdAt = new Date();

      await this.notificationRepo.save(notification);

      const tokens = await this.deviceRepo.findAllByUserId(new UserId(userId));
      const fcmTokens = tokens.map(t => t.value);

      if (fcmTokens.length > 0) {
        await this.pushProvider.send(fcmTokens, title, body);
      }
    }
  }
}