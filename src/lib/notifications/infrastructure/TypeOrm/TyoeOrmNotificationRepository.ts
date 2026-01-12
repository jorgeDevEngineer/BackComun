import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection, Db } from 'mongodb'; 
import { NotificationEntity } from './NotificationEntity';
import { DynamicMongoAdapter } from 'src/lib/shared/infrastructure/database/dynamic-mongo.adapter'; 
import { INotificationRepository } from '../../domain/port/INotificationRepository';

interface MongoNotificationDocument {
  _id: string; 
  userId: string;
  type: string;
  title: string;
  body: string;
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


  async save(notification: NotificationEntity): Promise<void> {
    
        try {
            const collection = await this.getMongoCollection();
            const mongoDoc: MongoNotificationDocument = {
                _id: notification.id,
                userId: notification.userId,
                type: notification.type,
                title: notification.title,
                body: notification.body,
                isRead: notification.isRead,
                resourceId: notification.resourceId,
                createdAt: notification.createdAt || new Date(),
            };

            await collection.replaceOne({ _id: mongoDoc._id }, mongoDoc, { upsert: true });
            return; 

        } catch (error) {
            this.logger.warn(`MongoDB save history failed: ${error.message}`);
        }
    
      try {
      await this.pgRepo.save(notification);
      this.logger.debug(`Notificación guardada (PG): ${notification.title}`);
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
                    entity.title = doc.title;
                    entity.body = doc.body;
                    entity.isRead = doc.isRead;
                    entity.resourceId = doc.resourceId;
                    entity.createdAt = doc.createdAt;
                    return entity;
                });
            }
            return []; 
        } catch (error) {
            this.logger.error(`MongoDB find history failed: ${error.message}`);
        }
    

    return this.pgRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 20, 
    });
  }
}