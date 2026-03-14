# MikroORM AdonisJS Example App

Blog API built with [AdonisJS](https://adonisjs.com/) and [MikroORM](https://mikro-orm.io/), demonstrating how to integrate MikroORM as the data layer in an AdonisJS application.

This example uses the same blog domain as the [MikroORM Getting Started Guide](https://mikro-orm.io/docs/guide) — users, articles, comments, and tags — adapted to follow AdonisJS conventions.

Based on the [AdonisJS slim starter kit](https://github.com/adonisjs/slim-starter-kit).

## Features

- **MikroORM integration** via AdonisJS service provider, middleware, and IoC container
- **Dependency injection** — `MikroORM`, `EntityManager`, and repositories injected via `@inject()`
- **Entity definitions** using `defineEntity` with full type inference
- **Request-scoped identity map** via `RequestContext` middleware
- **Custom repositories** with query builder usage
- **Soft delete** via event subscriber
- **JWT authentication** (lightweight, no external dependencies)
- **Virtual entities** for optimized listing queries
- **Embedded entities** (user social links)
- **SQLite** for zero-config setup

## Prerequisites

- Node.js >= 20
- npm

## Setup

```bash
npm install
cp .env.example .env   # then edit APP_KEY
```

## Development

```bash
node ace serve --hmr
```

The server starts at `http://localhost:3333`. Schema is synced automatically on startup.

## API Endpoints

### Users

| Method | URL | Description |
|--------|-----|-------------|
| POST | `/user/sign-up` | Register a new user |
| POST | `/user/sign-in` | Login with email/password |
| GET | `/user/profile` | Get current user profile (auth required) |
| PATCH | `/user/profile` | Update current user profile (auth required) |

### Articles

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/article` | List all articles |
| GET | `/article/:slug` | Get article detail |
| POST | `/article` | Create a new article (auth required) |
| PATCH | `/article/:id` | Update an article (auth required, author only) |
| DELETE | `/article/:id` | Delete an article (auth required, author only) |
| POST | `/article/:slug/comment` | Add a comment (auth required) |

Use `Authorization: Bearer <token>` header for authenticated requests. The token is returned in sign-up/sign-in responses.

## Testing

```bash
node ace test
```

## Project Structure

```
├── app/
│   ├── controllers/          # HTTP request handlers (inject repositories)
│   ├── entities/             # MikroORM entity definitions
│   ├── exceptions/           # Error handler (MikroORM NotFoundError)
│   ├── middleware/            # RequestContext + auth middleware
│   ├── repositories/         # Custom entity repositories
│   ├── services/             # JWT helper
│   ├── subscribers/          # MikroORM event subscribers
│   └── types.ts              # HttpContext type augmentation
├── config/                   # AdonisJS configuration
├── database/seeders/         # Test data seeders
├── providers/
│   └── mikro_orm_provider.ts # Registers MikroORM + repos in IoC container
├── src/
│   └── mikro-orm.config.ts   # MikroORM configuration
├── start/
│   ├── env.ts                # Environment validation
│   ├── kernel.ts             # Middleware registration
│   └── routes.ts             # Route definitions
└── tests/                    # Integration tests (Japa)
```

## Key Integration Points

### Service Provider (`providers/mikro_orm_provider.ts`)

Registers `MikroORM`, `EntityManager`, and repositories directly in the IoC container:

```ts
import { MikroORM, EntityManager } from '@mikro-orm/sqlite'

export default class MikroOrmProvider {
  register() {
    this.app.container.singleton(MikroORM, () => new MikroORM(config))

    this.app.container.singleton(EntityManager, async (resolver) => {
      const orm = await resolver.make(MikroORM)
      return orm.em
    })

    this.app.container.singleton(UserRepository, async (resolver) => {
      const orm = await resolver.make(MikroORM)
      return orm.em.getRepository(UserSchema)
    })

    this.app.container.singleton(ArticleRepository, async (resolver) => {
      const orm = await resolver.make(MikroORM)
      return orm.em.getRepository(ArticleSchema)
    })
  }
}
```

### RequestContext Middleware (`app/middleware/mikro_orm_middleware.ts`)

Injected via the container, creates a fresh identity map per request:

```ts
@inject()
export default class MikroOrmMiddleware {
  constructor(protected orm: MikroORM) {}

  handle(_ctx: HttpContext, next: NextFn) {
    return RequestContext.create(this.orm.em, () => next())
  }
}
```

### Controllers with Dependency Injection

Controllers inject `EntityManager` and repositories directly:

```ts
@inject()
export default class ArticlesController {
  constructor(
    protected em: EntityManager,
    protected articleRepo: ArticleRepository,
  ) {}

  async index({ request }: HttpContext) {
    const { items, total } = await this.articleRepo.listArticles({
      limit: request.input('limit'),
      offset: request.input('offset'),
    })
    return { items, total }
  }
}
```
