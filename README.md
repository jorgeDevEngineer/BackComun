# NestJS + TypeORM + Postgres (Hexagonal) 🚀

<p align="center"><a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a></p>

Proyecto backend diseñado para emular las funcionalidades de Kahoot, permitiendo la gestión de quizzes, salas en tiempo real y sistemas de puntuación competitivos. 🎮

## 🧭 Arquitectura del Proyecto

El sistema está estructurado siguiendo los principios de la Arquitectura Hexagonal. Cada módulo de NestJS funciona como su propio hexágono, fomentando la separación de responsabilidades y facilitando el mantenimiento.

### Estructura de Capas por Módulo:

🟡 **Domain:** El núcleo del negocio. Contiene entities, value-objects, aggregates y las interfaces de los repositories (puertos de salida).

Para visualizar mejor el modelo de dominio expuesto, consulta el siguiente diagrama: 👉 **[Ver Diagrama Modelo de Dominio](https://lucid.app/lucidchart/c54dbe5b-aec8-4c01-8c33-933dc3005d76/edit?invitationId=inv_b30a5a60-c316-4ea5-b4bd-5900b0ac2294)** 👈



🟣 **Application:** Lógica de aplicación y orquestación. Incluye los use-cases (puertos de entrada), application-services.

🔵 **Infrastructure:** Implementaciones técnicas y adaptadores. Contiene los controladores REST, gateways de WebSockets, entidades de base de datos (TypeORM) y la configuración de los módulos de NestJS.

## 🛠️ Tecnologías Principales
```Framework:``` NestJS 🔺

```ORM:``` TypeORM 🗄️

```Base de Datos:``` PostgreSQL y MongoDB


## Instalación y Configuración⚡

1. Clona el repositorio:  
```bash
git clone https://github.com/jorgeDevEngineer/BackComun.git
```
2. Configura el entorno: Copia el archivo de ejemplo y ajusta tus credenciales de base de datos:
```bash
cp .env.example .env
```

3. Instala dependencias:  
```bash
   npm install
```
4. Ejecución:

```bash

# Desarrollo
npm run start

# Modo Watch 
npm run start:dev
```
## 📚 Uso y Endpoints

```API REST:``` Endpoints dedicados para el CRUD completo de quizzes y gestión de preguntas.

```WebSockets:``` Gestión de salas de juego, unión de jugadores y actualización de puntuaciones en vivo.

## Autores 👥

Jorge Ignacio Ramírez Millán
✉️ jorge.dev.engineer@gmail.com

Diego García
✉️ diego.frnz.2004@gmail.com

José Gabriel Vilchez Porra
✉️ jgvilchez.dev@gmail.com

José Alejandro Briceño Luzardo
✉️ josea2102@gmail.com 

Daniel García
✉️ dangar452000@gmail.com

Andrés Guilarte
✉️ andresguilartelamuno@gmail.com

## Licencia 📄
MIT