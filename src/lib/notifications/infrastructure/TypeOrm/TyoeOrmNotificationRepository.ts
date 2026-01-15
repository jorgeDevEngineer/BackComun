import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection, Db } from 'mongodb'; 
import { NotificationEntity } from './NotificationEntity';
import { DynamicMongoAdapter } from 'src/lib/shared/infrastructure/database/dynamic-mongo.adapter'; 
import { INotificationRepository } from '../../domain/port/INotificationRepository';
import { notificationId } from '../../domain/valueObject/NotificationId'; 
import { Optional } from 'src/lib/shared/Type Helpers/Optional'; 
import { Notification } from '../../domain/Notification';
import { UserId } from 'src/lib/user/domain/valueObject/UserId';

interface MongoNotificationDocument {
  _id: string; 
  userId: string;
  type: string;
  message: string;
  isRead: boolean;
  resourceId?: string;
  createdAt: Date;
}

@Injectable()
export class TypeOrmNotificationRepository implements INotificationRepository {
  private readonly logger = new Logger(TypeOrmNotificationRepository.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly pgRepo: Repository<NotificationEntity>,
    private readonly mongoAdapter: DynamicMongoAdapter,
  ) {}

  private async getMongoCollection(): Promise<Collection<MongoNotificationDocument>> {
    const db: Db = await this.mongoAdapter.getConnection('notifications');
    return db.collection<MongoNotificationDocument>('history');
  }
  async findById(id: notificationId): Promise<Optional<Notification>> {
    const orm = await this.pgRepo.findOne({ where: { id: id.value } });

    if (!orm) {
      return new Optional<Notification>(null);
    }
    const domainNotification = Notification.createFromPersistence(
        notificationId.of(orm.id),
        new UserId(orm.userId),
        orm.type,
        orm.message,
        orm.isRead,
        orm.createdAt,
        orm.resourceId
    );

    return new Optional(domainNotification);
  }

  async save(notification: Notification): Promise<void> {
    const rawId = typeof notification.id === 'object' ? (notification.id as any).value : notification.id;
    const rawUserId = typeof notification.userId === 'object' ? (notification.userId as any).value : notification.userId;

  let rawResourceId: string | null = null;
  if (notification.resourceId) {
    if (typeof notification.resourceId.getValue === 'function') {
      rawResourceId = notification.resourceId.hasValue() ? notification.resourceId.getValue() : null;
    } else if ((notification.resourceId as any).value) {
      rawResourceId = (notification.resourceId as any).value;
    } else if (typeof notification.resourceId === 'string') {
      rawResourceId = notification.resourceId;
    }
  }

  try {
    const collection = await this.getMongoCollection();
    const mongoDoc = {
      _id: rawId,
      userId: rawUserId,
      type: notification.type,
      message: notification.message,
      isRead: notification.isRead,
      resourceId: rawResourceId,
      createdAt: notification.createdAt || new Date(),
    };
    await collection.replaceOne({ _id: rawId }, mongoDoc, { upsert: true });
  } catch (error) {
    this.logger.warn(`MongoDB save history failed: ${error.message}`);
  }
  try {
    const entityToSave = {
      id: rawId,          
      userId: rawUserId,  
      type: notification.type,
      message: notification.message,
      isRead: notification.isRead,
      resourceId: rawResourceId,
      createdAt: notification.createdAt
    };

    await this.pgRepo.save(entityToSave);
    this.logger.debug(`Notificación guardada (PG): ${notification.message}`);
  } catch (error) {
    this.logger.error(`Postgres save history failed: ${error.message}`);
  }
}

  async findByUserId(userId: string): Promise<NotificationEntity[]> {
    try {
      const collection = await this.getMongoCollection();
      const docs = await collection
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray();

      if (docs.length > 0) {
        return docs.map(doc => {
          const entity = new NotificationEntity();
          entity.id = doc._id;
          entity.userId = doc.userId;
          entity.type = doc.type;
          entity.message = doc.message;
          entity.isRead = doc.isRead;
          entity.resourceId = doc.resourceId;
          entity.createdAt = doc.createdAt;
          return entity;
        });
      }
      return []; 
    } catch (error) {
      this.logger.warn(`MongoDB find history failed: ${error.message}`);
    }

    return this.pgRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 20, 
    });
  }
}