import { mock, MockProxy } from 'jest-mock-extended';
import { Repository } from 'typeorm';
import { Collection, Db } from 'mongodb';
import { TypeOrmQuizReadService } from '../../infraestructure/TypeOrm/QuizReadServiceImplementation'; 
import { TypeOrmQuizEntity } from '../../../kahoot/infrastructure/TypeOrm/TypeOrmQuizEntity'; 
import { DynamicMongoAdapter } from 'src/lib/shared/infrastructure/database/dynamic-mongo.adapter';
import { QuizId } from 'src/lib/kahoot/domain/valueObject/Quiz';
import { UserId } from 'src/lib/user/domain/valueObject/UserId';

export class QuizReadServiceTestBuilder {
  private pgRepoMock: MockProxy<Repository<TypeOrmQuizEntity>>;
  private mongoAdapterMock: MockProxy<DynamicMongoAdapter>;
  
  private dbMock: MockProxy<Db>;
  private collectionMock: MockProxy<Collection>;

  private service: TypeOrmQuizReadService;
  private result: boolean | null = null;

  constructor() {
    this.pgRepoMock = mock<Repository<TypeOrmQuizEntity>>();
    this.mongoAdapterMock = mock<DynamicMongoAdapter>();
    
    this.dbMock = mock<Db>();
    this.collectionMock = mock<Collection>();

    this.mongoAdapterMock.getConnection.calledWith('kahoot').mockResolvedValue(this.dbMock);
    this.dbMock.collection.calledWith('quizzes').mockReturnValue(this.collectionMock);

    this.service = new TypeOrmQuizReadService(
      this.pgRepoMock,
      this.mongoAdapterMock
    );
  }
    // GIVEN (Escenarios de MongoDB) 
  public givenMongoFindsQuiz(): this {
    // Simulamos que Mongo encuentra un documento
    this.collectionMock.findOne.mockResolvedValue({ _id: 'any', title: 'Found in Mongo' });
    return this;
  }
  public givenMongoDoesNotFindQuiz(): this {
    this.collectionMock.findOne.mockResolvedValue(null);
    return this;
  }

  public givenMongoFailsWithError(): this {
    this.collectionMock.findOne.mockRejectedValue(new Error('Mongo Connection Timeout'));
    return this;
  }

  // GIVEN (Escenarios de Postgres) 

  public givenPostgresFindsQuiz(): this {
    // Simulamos que TypeORM encuentra la entidad
    this.pgRepoMock.findOne.mockResolvedValue({ id: 'any' } as TypeOrmQuizEntity);
    return this;
  }
  public givenPostgresDoesNotFindQuiz(): this {
    // Simulamos que TypeORM devuelve null
    this.pgRepoMock.findOne.mockResolvedValue(null);
    return this;
  }

  // WHEN

  public async whenCheckingOwnership(quizIdStr: string, userIdStr: string): Promise<this> {
    const quizId = QuizId.of(quizIdStr);
    const userId = new UserId(userIdStr);
    this.result = await this.service.quizBelongsToUser(quizId, userId);
    return this;
  }

  // THEN 

  public thenShouldReturnTrue(): void {
    expect(this.result).toBe(true);
  }

  public thenShouldReturnFalse(): void {
    expect(this.result).toBe(false);
  }

  public thenShouldHaveCalledPostgresFallback(): void {
    expect(this.pgRepoMock.findOne).toHaveBeenCalledTimes(1);
  }
  public thenShouldNotHaveCalledPostgres(): void {
    expect(this.pgRepoMock.findOne).not.toHaveBeenCalled();
  }
}