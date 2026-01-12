import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection, Db } from 'mongodb'; 
import { IDeviceRepository } from '../../domain/port/IDeviceRepository';
import { DeviceToken } from '../../domain/valueObject/DeviceToken';
import { UserId } from 'src/lib/user/domain/valueObject/UserId';
import { DeviceEntity } from './NotificationOrmEntity'; 
import { DynamicMongoAdapter } from 'src/lib/shared/infrastructure/database/dynamic-mongo.adapter';

interface MongoDeviceDocument {
  _id: string; 
  userId: string;
  deviceType: string;
  updatedAt: Date;
}

@Injectable()
export class TypeOrmDeviceRepository implements IDeviceRepository {
  private readonly logger = new Logger(TypeOrmDeviceRepository.name);

  constructor(
    @InjectRepository(DeviceEntity)
    private readonly pgRepo: Repository<DeviceEntity>,
    private readonly mongoAdapter: DynamicMongoAdapter,
  ) {}

  private async getMongoCollection(): Promise<Collection<MongoDeviceDocument>> {
    const db: Db = await this.mongoAdapter.getConnection('notifications');
    return db.collection<MongoDeviceDocument>('devices');
  }

  async saveToken(userId: UserId, token: DeviceToken, deviceType: string): Promise<void> {
    
    try {
      const collection = await this.getMongoCollection();
      const mongoDoc: MongoDeviceDocument = {
        _id: token.value,
        userId: userId.value,
        deviceType: deviceType,
        updatedAt: new Date(),
      };
      
      await collection.replaceOne({ _id: mongoDoc._id }, mongoDoc, { upsert: true });
      return; 
    } catch (error) {
      this.logger.warn(`MongoDB save failed, falling back to Postgres. Error: ${error.message}`);
    }

    try {
      await this.pgRepo.upsert(
        {
          token: token.value,
          userId: userId.value,
          deviceType: deviceType,
        },
        ['token']
      );
      this.logger.debug(`Token guardado (PG): ${token.value.substring(0, 10)}...`);
    } catch (error) {
      this.logger.error(`Postgres save failed: ${error.message}`);
      throw error;
    }
  }

  async removeToken(userId: string, token: DeviceToken): Promise<void> {
    
    try {
      const collection = await this.getMongoCollection();
      await collection.deleteOne({ 
          userId: userId,
          _id: token.value 
      });
      return; 
    } catch (error) {
      this.logger.warn(`MongoDB delete failed, falling back to Postgres. Error: ${error.message}`);
    }

    try {
        await this.pgRepo.delete({ 
            token: token.value,
            userId: userId
        });
        this.logger.debug(`Token eliminado (PG): ${token.value.substring(0, 10)}...`);
    } catch (error) {
        this.logger.error(`Postgres delete failed: ${error.message}`);
        throw error;
    }
  }


  async findAllByUserId(memberId: UserId): Promise<DeviceToken[]> {
    
    try {
      const collection = await this.getMongoCollection();
      const docs = await collection.find({ userId: memberId.value }).toArray(); // Ojo: memberId.value si en mongo guardas string

      if (docs.length > 0) {
        return docs.map((d) => DeviceToken.create(d._id));
      }

      if (docs) { 
         return docs.map((d) => DeviceToken.create(d._id));
      }

    } catch (error) {
      this.logger.warn(`MongoDB find failed. Falling back to Postgres.`);
    }

    const entities = await this.pgRepo.find({
      where: { userId: memberId.getValue() },
    });

    return entities.map((e) => DeviceToken.create(e.token));
  }
}