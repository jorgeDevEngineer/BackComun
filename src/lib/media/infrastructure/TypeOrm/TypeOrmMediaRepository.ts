
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection, Db, WithId } from 'mongodb';
import { DynamicMongoAdapter } from '../../../shared/infrastructure/database/dynamic-mongo.adapter';
import { Media } from '../../domain/entity/Media';
import { IMediaRepository } from '../../domain/port/IMediaRepository';
import { TypeOrmMediaEntity } from './TypeOrmMediaEntity';
import { AuthorId, CreatedAt, MediaCategory, MediaId, MediaName, MediaUrl } from '../../domain/value-object/MediaId';

// Unified interface for the MongoDB document, using camelCase
export interface MongoMediaDocument {
  _id: string;
  authorId: string;
  name: string;
  url: string;
  category: string;
  createdAt: Date;
}

@Injectable()
export class TypeOrmMediaRepository implements IMediaRepository {
  constructor(
    @InjectRepository(TypeOrmMediaEntity)
    private readonly pgRepository: Repository<TypeOrmMediaEntity>,
    private readonly mongoAdapter: DynamicMongoAdapter,
  ) {}

  private async getMongoCollection(): Promise<Collection<MongoMediaDocument>> {
    const db: Db = await this.mongoAdapter.getConnection('media');
    return db.collection<MongoMediaDocument>('media');
  }

  async save(media: Media): Promise<void> {
    try {
      const collection = await this.getMongoCollection();
      const mongoDoc = this.mapDomainToMongo(media);
      await collection.replaceOne({ _id: mongoDoc._id }, mongoDoc, { upsert: true });
    } catch (error) {
      console.log('MongoDB connection not available, falling back to PostgreSQL for save.');
      const pgEntity = this.mapDomainToPg(media);
      await this.pgRepository.save(pgEntity);
    }
  }

  async findById(id: string): Promise<Media | null> {
    try {
      const collection = await this.getMongoCollection();
      const mongoDoc: WithId<MongoMediaDocument> | null = await collection.findOne({ _id: id });
      return mongoDoc ? this.mapMongoToDomain(mongoDoc) : null;
    } catch (error) {
      console.log('MongoDB connection not available, falling back to PostgreSQL for find by ID.');
      const pgEntity = await this.pgRepository.findOne({ where: { id } });
      return pgEntity ? this.mapPgToDomain(pgEntity) : null;
    }
  }

  async findAll(): Promise<Media[]> {
    try {
      const collection = await this.getMongoCollection();
      const mongoDocs = await collection.find().toArray();
      return mongoDocs.map(doc => this.mapMongoToDomain(doc));
    } catch (error) {
      console.log('MongoDB connection not available, falling back to PostgreSQL for find all.');
      const pgEntities = await this.pgRepository.find();
      return pgEntities.map(entity => this.mapPgToDomain(entity));
    }
  }

  async findAllByAuthor(authorId: string): Promise<Media[]> {
    try {
      const collection = await this.getMongoCollection();
      const mongoDocs = await collection.find({ authorId }).toArray();
      return mongoDocs.map(doc => this.mapMongoToDomain(doc));
    } catch (error) {
      console.log('MongoDB connection not available, falling back to PostgreSQL for find by author.');
      const pgEntities = await this.pgRepository.find({ where: { authorId } });
      return pgEntities.map(entity => this.mapPgToDomain(entity));
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const collection = await this.getMongoCollection();
      await collection.deleteOne({ _id: id });
    } catch (error) {
      console.log('MongoDB connection not available, falling back to PostgreSQL for delete.');
      await this.pgRepository.delete(id);
    }
  }

  async findByCategory(category: string): Promise<Media[]> {
    try {
      const collection = await this.getMongoCollection();
      const mongoDocs = await collection.find({ category }).toArray();
      return mongoDocs.map(doc => this.mapMongoToDomain(doc));
    } catch (error) {
      console.log('MongoDB connection not available, falling back to PostgreSQL for find by category.');
      const pgEntities = await this.pgRepository.find({ where: { category } });
      return pgEntities.map(entity => this.mapPgToDomain(entity));
    }
  }

  private mapDomainToMongo(media: Media): MongoMediaDocument {
    const plain = media.toPlainObject();
    return {
      _id: plain.id,
      authorId: plain.authorId,
      name: plain.name,
      url: plain.url,
      category: plain.category,
      createdAt: plain.createdAt,
    };
  }

  private mapDomainToPg(media: Media): TypeOrmMediaEntity {
    const plain = media.toPlainObject();
    const entity = new TypeOrmMediaEntity();
    entity.id = plain.id;
    entity.authorId = plain.authorId;
    entity.name = plain.name;
    entity.url = plain.url;
    entity.category = plain.category;
    entity.createdAt = plain.createdAt;
    return entity;
  }

  private mapMongoToDomain(mongoDoc: MongoMediaDocument): Media {
    return Media.fromDb(
      MediaId.of(mongoDoc._id),
      AuthorId.of(mongoDoc.authorId),
      MediaName.of(mongoDoc.name),
      MediaUrl.of(mongoDoc.url),
      MediaCategory.of(mongoDoc.category),
      CreatedAt.of(mongoDoc.createdAt),
    );
  }

  private mapPgToDomain(pgEntity: TypeOrmMediaEntity): Media {
    return Media.fromDb(
      MediaId.of(pgEntity.id),
      AuthorId.of(pgEntity.authorId),
      MediaName.of(pgEntity.name),
      MediaUrl.of(pgEntity.url),
      MediaCategory.of(pgEntity.category),
      CreatedAt.of(pgEntity.createdAt),
    );
  }
}
