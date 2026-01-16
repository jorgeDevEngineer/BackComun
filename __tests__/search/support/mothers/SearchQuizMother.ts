import { SearchResultDto } from "../../../../src/lib/search/application/SearchQuizzesUseCase";
import { CategoriesDTO } from "../../../../src/lib/search/application/GetCategoriesUseCase";

/**
 * Object Mother para crear datos de prueba del módulo search.
 * Se usan objetos planos para evitar problemas de imports con extensiones .js en los tests de Jest.
 */
export class SearchQuizMother {
  private static VALID_UUID_QUIZ = "550e8400-e29b-41d4-a716-446655440000";
  private static VALID_UUID_AUTHOR = "660e8400-e29b-41d4-a716-446655440001";

  /**
   * Crea un resultado de búsqueda con la cantidad de quizzes especificada.
   */
  static createSearchResult(count: number = 2): SearchResultDto {
    return {
      data: Array.from({ length: count }, (_, i) => ({
        id: `quiz-${i + 1}`,
        title: `Quiz ${i + 1}`,
        description: `Descripción del quiz ${i + 1}`,
        themeId: "theme-1",
        category: "General",
        author: {
          id: `author-${i + 1}`,
          name: `Autor ${i + 1}`,
        },
        coverImageId: null,
        playCount: i * 10,
        createdAt: new Date("2024-01-01"),
        visibility: "public",
        Status: "published",
      })),
      pagination: {
        page: 1,
        limit: 10,
        totalCount: count,
        totalPages: Math.ceil(count / 10) || 1,
      },
    };
  }

  /**
   * Crea un resultado de búsqueda con paginación personalizada.
   */
  static createPaginatedResult(
    count: number,
    page: number,
    limit: number,
    totalCount: number
  ): SearchResultDto {
    return {
      ...this.createSearchResult(count),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  /**
   * Crea un resultado de quizzes destacados.
   */
  static createFeaturedResult(count: number = 5): SearchResultDto {
    return {
      data: Array.from({ length: count }, (_, i) => ({
        id: `featured-quiz-${i + 1}`,
        title: `Quiz Destacado ${i + 1}`,
        description: `Descripción del quiz destacado ${i + 1}`,
        themeId: "theme-destacado",
        category: "Destacado",
        author: {
          id: `author-${i + 1}`,
          name: `Autor Destacado ${i + 1}`,
        },
        coverImageId: `cover-${i + 1}`,
        playCount: 1000 + i * 100,
        createdAt: new Date("2024-01-01"),
        visibility: "public",
        Status: "published",
      })),
      pagination: {
        page: 1,
        limit: count,
        totalCount: count,
        totalPages: 1,
      },
    };
  }

  /**
   * Crea una lista de categorías.
   */
  static createCategories(names: string[] = ["Tecnología", "Ciencia", "Historia", "Arte"]): { name: string }[] {
    return names.map((name) => ({ name }));
  }

  /**
   * Crea un resultado de búsqueda vacío.
   */
  static createEmptyResult(): SearchResultDto {
    return this.createSearchResult(0);
  }

  /**
   * Retorna el UUID válido para el quiz de pruebas.
   */
  static getQuizId(): string {
    return SearchQuizMother.VALID_UUID_QUIZ;
  }

  /**
   * Retorna el UUID válido para el autor de pruebas.
   */
  static getAuthorId(): string {
    return SearchQuizMother.VALID_UUID_AUTHOR;
  }
}

