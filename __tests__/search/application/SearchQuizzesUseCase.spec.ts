import { SearchQuizzesUseCase, SearchParamsDto } from "../../../src/lib/search/application/SearchQuizzesUseCase";
import { QuizRepository } from "../../../src/lib/search/domain/port/QuizRepository";
import { SearchQuizMother } from "../support/mothers/SearchQuizMother";

describe("SearchQuizzesUseCase (Application Layer)", () => {
  let quizRepositoryStub: jest.Mocked<QuizRepository>;
  let useCase: SearchQuizzesUseCase;

  beforeEach(() => {
    // ARRANGE - Crear stub del repositorio
    quizRepositoryStub = {
      search: jest.fn(),
      findFeatured: jest.fn(),
      getCategories: jest.fn(),
    };

    useCase = new SearchQuizzesUseCase(quizRepositoryStub);
  });

  it("debería retornar quizzes que coincidan con la consulta de búsqueda", async () => {
    // ARRANGE
    const searchParams: SearchParamsDto = {
      q: "matematicas",
      order: "desc",
    };
    const searchResult = SearchQuizMother.createSearchResult(2);
    quizRepositoryStub.search.mockResolvedValue(searchResult);

    // ACT
    const result = await useCase.execute(searchParams);

    // ASSERT
    expect(result.isSuccess).toBe(true);
    const resultValue = result.getValue();
    expect(resultValue).not.toBeNull();
    expect(resultValue!.data).toHaveLength(2);
    expect(resultValue!.pagination.totalCount).toBe(2);
    expect(quizRepositoryStub.search).toHaveBeenCalledWith(searchParams);
  });

  it("debería retornar quizzes filtrados por categorías", async () => {
    // ARRANGE
    const searchParams: SearchParamsDto = {
      categories: ["Ciencia", "Matemáticas"],
      order: "asc",
    };
    const searchResult = SearchQuizMother.createSearchResult(3);
    quizRepositoryStub.search.mockResolvedValue(searchResult);

    // ACT
    const result = await useCase.execute(searchParams);

    // ASSERT
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()!.data).toHaveLength(3);
    expect(quizRepositoryStub.search).toHaveBeenCalledWith(searchParams);
  });

  it("debería retornar resultados paginados correctamente", async () => {
    // ARRANGE
    const searchParams: SearchParamsDto = {
      limit: 5,
      page: 2,
      order: "desc",
    };
    const searchResult = SearchQuizMother.createPaginatedResult(5, 2, 5, 15);
    quizRepositoryStub.search.mockResolvedValue(searchResult);

    // ACT
    const result = await useCase.execute(searchParams);

    // ASSERT
    expect(result.isSuccess).toBe(true);
    const resultValue = result.getValue();
    expect(resultValue!.pagination.page).toBe(2);
    expect(resultValue!.pagination.limit).toBe(5);
    expect(resultValue!.pagination.totalPages).toBe(3);
  });

  it("debería retornar una lista vacía cuando no hay quizzes que coincidan", async () => {
    // ARRANGE
    const searchParams: SearchParamsDto = {
      q: "quiz-inexistente-xyz",
      order: "desc",
    };
    const emptyResult = SearchQuizMother.createEmptyResult();
    quizRepositoryStub.search.mockResolvedValue(emptyResult);

    // ACT
    const result = await useCase.execute(searchParams);

    // ASSERT
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()!.data).toHaveLength(0);
    expect(result.getValue()!.pagination.totalCount).toBe(0);
  });

  it("debería soportar ordenamiento por diferentes campos", async () => {
    // ARRANGE
    const searchParams: SearchParamsDto = {
      orderBy: "playCount",
      order: "desc",
    };
    const searchResult = SearchQuizMother.createSearchResult(2);
    quizRepositoryStub.search.mockResolvedValue(searchResult);

    // ACT
    const result = await useCase.execute(searchParams);

    // ASSERT
    expect(result.isSuccess).toBe(true);
    expect(quizRepositoryStub.search).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: "playCount",
        order: "desc",
      })
    );
  });
});
