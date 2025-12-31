# 📘 Documentación: Builders de Repositorios

## 1. Objetivo
El patrón **Builder** se utiliza para construir repositorios de manera flexible y desacoplada, permitiendo seleccionar el motor de base de datos (Postgres o Mongo) y configurar las dependencias necesarias sin acoplar la lógica de construcción dentro de cada repositorio.

Este enfoque resuelve el problema de los **adaptadores**: cada repositorio puede tener diferentes implementaciones según el motor, y el builder centraliza la lógica de construcción.

---

## 2. Principios del diseño
- **Separación de responsabilidades**: el builder no ejecuta queries ni contiene lógica de negocio, solo construye repositorios.  
- **Flexibilidad**: permite cambiar el motor de base de datos mediante variables de entorno.  
- **Explicitez**: los repositorios TypeORM se inyectan con métodos `withX`, y los *criteria appliers* se pasan directamente en los métodos `buildXRepository`.  
- **Extensibilidad**: cuando se implementen repositorios para Mongo, solo se reemplazan los `throw new Error(...)` por la construcción real.

---

## 3. Estructura del Builder

### Ejemplo: `LibraryRepositoryBuilder`
```typescript
type DbType = 'postgres' | 'mongo';

export class LibraryRepositoryBuilder {
  private quizRepo?: Repository<TypeOrmQuizEntity>;
  private userRepo?: Repository<TypeOrmUserEntity>;
  private userFavRepo?: Repository<TypeOrmUserFavoriteQuizEntity>;
  private singleGameRepo?: Repository<TypeOrmSinglePlayerGameEntity>;

  constructor(private readonly dbType: DbType) {}

  // Métodos withX para inyectar repositorios
  withQuizRepo(repo: Repository<TypeOrmQuizEntity>) { this.quizRepo = repo; return this; }
  withUserRepo(repo: Repository<TypeOrmUserEntity>) { this.userRepo = repo; return this; }
  withUserFavoriteRepo(repo: Repository<TypeOrmUserFavoriteQuizEntity>) { this.userFavRepo = repo; return this; }
  withSinglePlayerGameRepo(repo: Repository<TypeOrmSinglePlayerGameEntity>) { this.singleGameRepo = repo; return this; }

  // Métodos build para construir repositorios
  buildUserFavoriteQuizRepository(
    criteriaApplier: CriteriaApplier<SelectQueryBuilder<TypeOrmUserFavoriteQuizEntity>, QuizQueryCriteria>
  ): IUserFavoriteQuizRepository {
    if (this.dbType === 'postgres') {
      return new TypeOrmUserFavoriteQuizRepository(this.userFavRepo!, criteriaApplier);
    }
    throw new Error('Mongo UserFavoriteQuizRepository no implementado aún');
  }

  buildQuizRepository(
    advancedCriteriaApplier: CriteriaApplier<SelectQueryBuilder<TypeOrmQuizEntity>, QuizQueryCriteria>
  ): IQuizRepository {
    if (this.dbType === 'postgres') {
      return new TypeOrmQuizRepository(this.quizRepo!, advancedCriteriaApplier);
    }
    throw new Error('Mongo QuizRepository no implementado aún');
  }

  buildUserRepository(): IUserRepository {
    if (this.dbType === 'postgres') {
      return new TypeOrmUserRepository(this.userRepo!);
    }
    throw new Error('Mongo UserRepository no implementado aún');
  }

  buildSinglePlayerGameRepository(
    advancedCriteriaApplier: CriteriaApplier<SelectQueryBuilder<TypeOrmSinglePlayerGameEntity>, QuizQueryCriteria>
  ): ISinglePlayerGameRepository {
    if (this.dbType === 'postgres') {
      return new TypeOrmSinglePlayerGameRepository(this.singleGameRepo!, advancedCriteriaApplier);
    }
    throw new Error('Mongo SinglePlayerGameRepository no implementado aún');
  }
}
```

## 4. Uso en un Módulo

```typescript
 @Module({
  imports: [
    TypeOrmModule.forFeature([
      TypeOrmUserFavoriteQuizEntity,
      TypeOrmQuizEntity,
      TypeOrmUserEntity,
      TypeOrmSinglePlayerGameEntity
    ]),
    LoggerModule
  ],
  providers: [
    { provide: 'CriteriaApplier', useClass: TypeOrmCriteriaApplier },
    { provide: 'AdvancedCriteriaApplier', useClass: TypeOrmQuizCriteriaApplier },

    {
      provide: 'LibraryRepositoryBuilder',
      useFactory: (
        quizRepo: Repository<TypeOrmQuizEntity>,
        userRepo: Repository<TypeOrmUserEntity>,
        userFavRepo: Repository<TypeOrmUserFavoriteQuizEntity>,
        singleGameRepo: Repository<TypeOrmSinglePlayerGameEntity>,
      ) => {
        const dbType: 'postgres' | 'mongo' =
          (process.env.LIBRARY_DB_TYPE as 'postgres' | 'mongo') || 'postgres';

        return new LibraryRepositoryBuilder(dbType)
          .withQuizRepo(quizRepo)
          .withUserRepo(userRepo)
          .withUserFavoriteRepo(userFavRepo)
          .withSinglePlayerGameRepo(singleGameRepo);
      },
      inject: [
        getRepositoryToken(TypeOrmQuizEntity),
        getRepositoryToken(TypeOrmUserEntity),
        getRepositoryToken(TypeOrmUserFavoriteQuizEntity),
        getRepositoryToken(TypeOrmSinglePlayerGameEntity),
      ],
    },

    {
      provide: 'UserFavoriteQuizRepository',
      useFactory: (builder: LibraryRepositoryBuilder, criteriaApplier: CriteriaApplier<SelectQueryBuilder<TypeOrmUserFavoriteQuizEntity>, QuizQueryCriteria>) =>
        builder.buildUserFavoriteQuizRepository(criteriaApplier),
      inject: ['LibraryRepositoryBuilder', 'CriteriaApplier'],
    },
    {
      provide: 'QuizRepository',
      useFactory: (builder: LibraryRepositoryBuilder, advancedCriteriaApplier: CriteriaApplier<SelectQueryBuilder<TypeOrmQuizEntity>, QuizQueryCriteria>) =>
        builder.buildQuizRepository(advancedCriteriaApplier),
      inject: ['LibraryRepositoryBuilder', 'AdvancedCriteriaApplier'],
    },
    {
      provide: 'UserRepository',
      useFactory: (builder: LibraryRepositoryBuilder) => builder.buildUserRepository(),
      inject: ['LibraryRepositoryBuilder'],
    },
    {
      provide: 'SinglePlayerGameRepository',
      useFactory: (builder: LibraryRepositoryBuilder, advancedCriteriaApplier: CriteriaApplier<SelectQueryBuilder<TypeOrmSinglePlayerGameEntity>, QuizQueryCriteria>) =>
        builder.buildSinglePlayerGameRepository(advancedCriteriaApplier),
      inject: ['LibraryRepositoryBuilder', 'AdvancedCriteriaApplier'],
    },
  ],
})
export class LibraryModule {}
```
 * Nota: Los criteria appliers son algo en espcífico de los módulos de biblioteca y de informes

## 5. Beneficios del enfoque

- **Desacoplamiento**  
  Los repositorios no contienen lógica de construcción, lo que facilita su mantenimiento y pruebas.

- **Flexibilidad**  
  Se puede cambiar el motor de base de datos (Postgres/Mongo) mediante una variable de entorno sin modificar el código.

- **Extensibilidad**  
  Cuando se implemente Mongo, solo se reemplazan los `throw new Error(...)` en el builder por la construcción real de los repositorios.

- **Claridad**  
  Cada repositorio recibe explícitamente sus dependencias en el método `buildXRepository`, evitando dependencias ocultas o implícitas.

- **Consistencia**  
  Todos los módulos siguen el mismo patrón de construcción, lo que facilita la colaboración y el entendimiento del código entre equipos.
