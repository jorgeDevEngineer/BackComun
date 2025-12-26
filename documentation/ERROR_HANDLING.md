
# Aspecto de Manejo de Errores: Patrón Result y Decorador

Este documento explica la implementación de un sistema robusto para el manejo de errores en la capa de aplicación, utilizando el patrón \`Result\` y un decorador especializado. El objetivo es desacoplar la lógica de negocio de la infraestructura, aumentar la previsibilidad del código y evitar que excepciones inesperadas detengan la aplicación.

## 1. El Problema: Acoplamiento y Errores Impredecibles

En una arquitectura tradicional, los casos de uso (capa de aplicación) a menudo lanzan excepciones directamente cuando algo sale mal:

\`\`\`typescript
// Mal ejemplo: El caso de uso está acoplado a NestJS
import { NotFoundException } from '@nestjs/common';

class GetQuizUseCase {
  async execute(id: string): Promise<Quiz> {
    const quiz = await this.quizRepository.find(id);
    if (!quiz) {
      // ¡MAL! El dominio/aplicación no debería saber nada sobre HTTP.
      throw new NotFoundException('Quiz not found'); 
    }
    return quiz;
  }
}
\`\`\`

Esto presenta varios problemas:

- **Acoplamiento Fuerte:** La capa de aplicación ahora depende de la infraestructura (\`@nestjs/common\`). Esto viola los principios de la Arquitectura Limpia.
- **Contratos Débiles:** La firma \`Promise<Quiz>\` no comunica que la operación puede fallar. El código que llama a este método debe usar un \`try...catch\`, pero no tiene forma de saber qué tipo de errores esperar.
- **Fragilidad:** Un error no previsto (ej. fallo de conexión a la BD) puede no ser capturado, provocando que la aplicación se detenga con un error 500 no controlado.

## 2. La Solución: El Objeto \`Result\`

Para solucionar esto, introducimos una clase genérica \`Result\`. Esta clase actúa como un contenedor que representa uno de dos posibles resultados de una operación:

- **Éxito (\`Ok\`):** La operación fue exitosa y contiene el valor resultante.
- **Fallo (\`Fail\`):** La operación falló y contiene la información del error.

La implementación se encuentra en \`src/common/domain/result.ts\` y su estructura es la siguiente:

\`\`\`typescript
export class Result<T> {
  public isSuccess: boolean;
  public isFailure: boolean;
  public error?: string; // El error es una propiedad pública
  private _value?: T;

  // ... constructor privado ...

  public getValue(): T | undefined { ... }

  public static ok<U>(value?: U): Result<U> { ... }

  public static fail<U>(error: string): Result<U> { ... }
}
\`\`\`

## 3. Refactorizando los Casos de Uso

Con la clase \`Result\`, los casos de uso ya no lanzan excepciones. En su lugar, devuelven un \`Result\`.

\`\`\`typescript
// Buen ejemplo: Caso de uso desacoplado y con un contrato claro.

class GetQuizUseCase implements IUseCase<string, Result<Quiz>> {
  async execute(id: string): Promise<Result<Quiz>> {
    const quiz = await this.quizRepository.find(id);
    if (!quiz) {
      // La operación falló, devolvemos un Result.fail
      return Result.fail<Quiz>('Quiz not found');
    }
    // La operación fue exitosa, devolvemos un Result.ok
    return Result.ok<Quiz>(quiz);
  }
}
\`\`\`

Ahora la firma del método, \`Promise<Result<Quiz>>\`, comunica claramente que la operación puede tener un resultado fallido que debe ser manejado.

## 4. El Decorador \`ErrorHandlingDecorator\`

Para evitar repetir el bloque \`try...catch\` en cada caso de uso y para manejar errores verdaderamente *inesperados* (bugs, fallos de red, etc.), utilizamos un decorador.

Este decorador envuelve la ejecución de un caso de uso. Su lógica es simple:

- Ejecuta el caso de uso.
- Si el caso de uso crashea con una excepción inesperada, la captura, la registra (log) y la convierte en un \`Result.fail\` genérico.

Se encuentra en \`src/aspects/error-handling/application/decorators/error-handling.decorator.ts\`.

\`\`\`typescript
export class ErrorHandlingDecorator<TRequest, TResponse> implements IUseCase<TRequest, Result<TResponse>> {
  constructor(
    private readonly useCase: IUseCase<TRequest, Result<TResponse>>,
    private readonly logger: ILoggerPort,
    private readonly useCaseName: string,
  ) {}

  async execute(request: TRequest): Promise<Result<TResponse>> {
    try {
      // Intenta ejecutar el caso de uso original
      return await this.useCase.execute(request);
    } catch (error: any) {
      // Si algo inesperado ocurre...
      this.logger.error(...);
      // ...devuelve un error genérico y seguro.
      return Result.fail<TResponse>('An unexpected technical error occurred.');
    }
  }
}
\`\`\`

## 5. ¿Cómo Implementar el Aspecto en un Módulo?

Para aplicar este sistema de manejo de errores a los casos de uso de un nuevo módulo (por ejemplo, un módulo \`Products\`), sigue estos pasos:

1.  **Refactoriza TODOS tus casos de uso para que devuelvan \`Result<T>\`**. El decorador de errores espera este tipo de retorno. Si un caso de uso no devuelve un `Result`, la compilación fallará.

2.  **En el archivo del módulo (ej: \`products.module.ts\`), utiliza \`useFactory\` para inyectar el caso de uso decorado.**


> **&#x26a0;&#xfe0f; Importante:** Al usar `useFactory` de esta manera, el token de inyección (`provide`) **debe ser la clase del caso de uso**, no un string. Esto permite que NestJS resuelva el tipo correctamente en los controladores.


\`\`\`typescript
import { Module } from '@nestjs/common';
import { CreateProductUseCase } from './application/CreateProductUseCase';
import { ProductController } from './infrastructure/NestJs/product.controller';
import { ILoggerPort } from '../../../aspects/logger/domain/ports/logger.port';
import { ProductRepository } from './domain/port/ProductRepository';
import { ErrorHandlingDecorator } from '../../../aspects/error-handling/application/decorators/error-handling.decorator';
import { LoggingUseCaseDecorator } from '../../../aspects/logger/application/decorators/logging.decorator';

@Module({
  imports: [/* ... tus imports ... */],
  controllers: [ProductController],
  providers: [
    {
      provide: 'ProductRepository', // o tu token de repositorio
      useClass: TypeOrmProductRepository,
    },
    {
      // VITAL: El token es la propia clase del caso de uso
      provide: CreateProductUseCase, 
      useFactory: (logger: ILoggerPort, repo: ProductRepository) => {
        // 1. Crea la instancia original del caso de uso
        const useCase = new CreateProductUseCase(repo);
        
        // 2. Envuelve el caso de uso con el decorador de manejo de errores
        const withErrorHandling = new ErrorHandlingDecorator(
          useCase, 
          logger, 
          'CreateProductUseCase' // Nombre para los logs
        );

        // 3. (Opcional) Envuelve el resultado con el decorador de logging
        return new LoggingUseCaseDecorator(
          withErrorHandling, 
          logger, 
          'CreateProductUseCase'
        );
      },
      inject: ['ILoggerPort', 'ProductRepository'], // Dependencias para la factory
    },
    // ... otros providers ...
  ],
})
export class ProductModule {}
\`\`\`



## 6. Manejo del \`Result\` en el Controlador

Finalmente, el controlador recibe el \`Result\` y decide qué hacer. Ahora, el controlador es el único responsable de conocer el protocolo HTTP. El decorador `@Inject()` debe usar la misma clase que usaste como token en el módulo.

\`\`\`typescript
@Controller('products')
export class ProductController {
  constructor(
    @Inject(CreateProductUseCase) // Inyecta usando la clase como token
    private readonly createProductUseCase: CreateProductUseCase
  ) {}

  @Post()
  async create(@Body() body: CreateProductDto) {
    // 1. Ejecuta el caso de uso
    const result = await this.createProductUseCase.execute(body);

    // 2. Comprueba si la operación falló
    if (result.isFailure) {
      // 3. Si falló, lanza una excepción HTTP apropiada con el error
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }

    // 4. Si fue exitosa, obtén el valor y devuélvelo
    const product = result.getValue();
    return product.toPlainObject();
  }
}
\`\`\`

## Beneficios Clave

- **Desacoplamiento:** La lógica de negocio no sabe nada sobre HTTP ni NestJS. Podemos cambiar el framework sin tocar los casos de uso.
- **Robustez y Seguridad:** Los errores inesperados son capturados y manejados de forma segura, evitando que la aplicación se caiga.
- **Contratos Explícitos:** La firma de un caso de uso deja claro que puede fallar, obligando al desarrollador a manejar ambos escenarios (éxito y fracaso).
- **Código Más Limpio:** Se elimina la necesidad de bloques \`try...catch\` en los controladores para la lógica de negocio esperada.
