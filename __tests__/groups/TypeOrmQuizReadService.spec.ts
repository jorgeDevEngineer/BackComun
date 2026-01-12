import { QuizReadServiceTestBuilder } from '../../src/lib/groups/application/test/quizReadServiceTestBuilder';

describe('TypeOrmQuizReadService (Infrastructure Layer)', () => {
  const QUIZ_ID = '123e4567-e89b-42d3-a456-426614174001';
  const USER_ID = '123e4567-e89b-42d3-a456-426614174999';

  //Mongo funciona y encuentra el quiz
  it('debería retornar TRUE si Mongo encuentra el quiz ', async () => {
    const test = new QuizReadServiceTestBuilder();

    await test
      .givenMongoFindsQuiz()
      .whenCheckingOwnership(QUIZ_ID, USER_ID)
      .then(() => {
        test.thenShouldReturnTrue();
        test.thenShouldNotHaveCalledPostgres(); 
      });
  });

  it('debería retornar FALSE si Mongo NO encuentra el quiz (sin tocar Postgres)', async () => {
    const test = new QuizReadServiceTestBuilder();

    await test
      .givenMongoDoesNotFindQuiz() 
      .whenCheckingOwnership(QUIZ_ID, USER_ID)
      .then(() => {
        test.thenShouldReturnFalse();
        test.thenShouldNotHaveCalledPostgres(); 
      });
  });

  it('debería hacer fallback a Postgres si Mongo falla, y retornar TRUE si Postgres lo encuentra', async () => {
    const test = new QuizReadServiceTestBuilder();

    await test
      .givenMongoFailsWithError() 
      .givenPostgresFindsQuiz()
      .whenCheckingOwnership(QUIZ_ID, USER_ID)
      .then(() => {
        test.thenShouldReturnTrue();
        test.thenShouldHaveCalledPostgresFallback(); 
      });
  });

  it('debería retornar FALSE si Mongo falla y Postgres tampoco lo encuentra', async () => {
    const test = new QuizReadServiceTestBuilder();

    await test
      .givenMongoFailsWithError()
      .givenPostgresDoesNotFindQuiz()
      .whenCheckingOwnership(QUIZ_ID, USER_ID)
      .then(() => {
        test.thenShouldReturnFalse();
      });
  });
});