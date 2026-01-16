import { GetCategoriesUseCase } from "../../../src/lib/search/application/GetCategoriesUseCase";
import { QuizRepository } from "../../../src/lib/search/domain/port/QuizRepository";
import { SearchQuizMother } from "../support/mothers/SearchQuizMother";

describe("GetCategoriesUseCase (Application Layer)", () => {
  let quizRepositoryStub: jest.Mocked<QuizRepository>;
  let useCase: GetCategoriesUseCase;

  beforeEach(() => {
    // ARRANGE - Crear stub del repositorio
    quizRepositoryStub = {
      search: jest.fn(),
      findFeatured: jest.fn(),
      getCategories: jest.fn(),
    };

    useCase = new GetCategoriesUseCase(quizRepositoryStub);
  });

  it("debería retornar todas las categorías disponibles", async () => {
    // ARRANGE
    const categorias = SearchQuizMother.createCategories();
    quizRepositoryStub.getCategories.mockResolvedValue(categorias);

    // ACT
    const result = await useCase.execute();

    // ASSERT
    expect(result.isSuccess).toBe(true);
    const resultValue = result.getValue();
    expect(resultValue).not.toBeNull();
    expect(resultValue!.categories).toHaveLength(4);
    expect(resultValue!.categories).toEqual(categorias);
    expect(quizRepositoryStub.getCategories).toHaveBeenCalledTimes(1);
  });

  it("debería retornar una lista vacía cuando no existen categorías", async () => {
    // ARRANGE
    quizRepositoryStub.getCategories.mockResolvedValue([]);

    // ACT
    const result = await useCase.execute();

    // ASSERT
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()!.categories).toHaveLength(0);
    expect(result.getValue()!.categories).toEqual([]);
  });

  it("debería retornar categorías con la estructura correcta", async () => {
    // ARRANGE
    const categorias = SearchQuizMother.createCategories(["Programación", "Idiomas"]);
    quizRepositoryStub.getCategories.mockResolvedValue(categorias);

    // ACT
    const result = await useCase.execute();

    // ASSERT
    expect(result.isSuccess).toBe(true);
    const categories = result.getValue()!.categories;
    categories.forEach((category) => {
      expect(category).toHaveProperty("name");
      expect(typeof category.name).toBe("string");
    });
  });

  it("debería manejar correctamente una sola categoría", async () => {
    // ARRANGE
    const categorias = SearchQuizMother.createCategories(["General"]);
    quizRepositoryStub.getCategories.mockResolvedValue(categorias);

    // ACT
    const result = await useCase.execute();

    // ASSERT
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()!.categories).toHaveLength(1);
    expect(result.getValue()!.categories[0].name).toBe("General");
  });
});
