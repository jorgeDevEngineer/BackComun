import { GetFeaturedQuizzesUseCase, GetFeaturedQuizzesParams } from "../../../src/lib/search/application/GetFeaturedQuizzesUseCase";
import { QuizRepository } from "../../../src/lib/search/domain/port/QuizRepository";
import { SearchQuizMother } from "../support/mothers/SearchQuizMother";

describe("GetFeaturedQuizzesUseCase (Application Layer)", () => {
  let quizRepositoryStub: jest.Mocked<QuizRepository>;
  let useCase: GetFeaturedQuizzesUseCase;

  beforeEach(() => {
    // ARRANGE - Crear stub del repositorio
    quizRepositoryStub = {
      search: jest.fn(),
      findFeatured: jest.fn(),
      getCategories: jest.fn(),
    };

    useCase = new GetFeaturedQuizzesUseCase(quizRepositoryStub);
  });

  it("debería retornar quizzes destacados con el límite especificado", async () => {
    // ARRANGE
    const params: GetFeaturedQuizzesParams = { limit: 5 };
    const featuredResult = SearchQuizMother.createFeaturedResult(5);
    quizRepositoryStub.findFeatured.mockResolvedValue(featuredResult);

    // ACT
    const result = await useCase.execute(params);

    // ASSERT
    expect(result.isSuccess).toBe(true);
    const resultValue = result.getValue();
    expect(resultValue).not.toBeNull();
    expect(resultValue!.data).toHaveLength(5);
    expect(quizRepositoryStub.findFeatured).toHaveBeenCalledWith(5);
  });

  it("debería limitar el número máximo de quizzes a 10", async () => {
    // ARRANGE
    const params: GetFeaturedQuizzesParams = { limit: 20 }; // Intenta pedir 20
    const featuredResult = SearchQuizMother.createFeaturedResult(10);
    quizRepositoryStub.findFeatured.mockResolvedValue(featuredResult);

    // ACT
    const result = await useCase.execute(params);

    // ASSERT
    expect(result.isSuccess).toBe(true);
    // El caso de uso debe limitar a 10 máximo
    expect(quizRepositoryStub.findFeatured).toHaveBeenCalledWith(10);
  });

  it("debería retornar un Result de fallo cuando no se encuentran quizzes destacados", async () => {
    // ARRANGE
    const params: GetFeaturedQuizzesParams = { limit: 5 };
    quizRepositoryStub.findFeatured.mockResolvedValue(null as any);

    // ACT
    const result = await useCase.execute(params);

    // ASSERT
    expect(result.isFailure).toBe(true);
    expect(result.error).not.toBeNull();
    expect(result.error!.message).toBe("Featured quizzes not found");
  });

  it("debería manejar una solicitud de un solo quiz destacado", async () => {
    // ARRANGE
    const params: GetFeaturedQuizzesParams = { limit: 1 };
    const featuredResult = SearchQuizMother.createFeaturedResult(1);
    quizRepositoryStub.findFeatured.mockResolvedValue(featuredResult);

    // ACT
    const result = await useCase.execute(params);

    // ASSERT
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()!.data).toHaveLength(1);
    expect(quizRepositoryStub.findFeatured).toHaveBeenCalledWith(1);
  });

  it("debería retornar quizzes destacados con la estructura de datos correcta", async () => {
    // ARRANGE
    const params: GetFeaturedQuizzesParams = { limit: 3 };
    const featuredResult = SearchQuizMother.createFeaturedResult(3);
    quizRepositoryStub.findFeatured.mockResolvedValue(featuredResult);

    // ACT
    const result = await useCase.execute(params);

    // ASSERT
    expect(result.isSuccess).toBe(true);
    const quizzes = result.getValue()!.data;

    quizzes.forEach((quiz) => {
      expect(quiz).toHaveProperty("id");
      expect(quiz).toHaveProperty("title");
      expect(quiz).toHaveProperty("description");
      expect(quiz).toHaveProperty("author");
      expect(quiz.author).toHaveProperty("id");
      expect(quiz.author).toHaveProperty("name");
      expect(quiz).toHaveProperty("playCount");
      expect(quiz).toHaveProperty("category");
    });
  });

  it("debería respetar el límite exacto cuando es menor al máximo", async () => {
    // ARRANGE
    const params: GetFeaturedQuizzesParams = { limit: 7 };
    const featuredResult = SearchQuizMother.createFeaturedResult(7);
    quizRepositoryStub.findFeatured.mockResolvedValue(featuredResult);

    // ACT
    const result = await useCase.execute(params);

    // ASSERT
    expect(result.isSuccess).toBe(true);
    expect(quizRepositoryStub.findFeatured).toHaveBeenCalledWith(7);
    expect(result.getValue()!.data).toHaveLength(7);
  });
});
