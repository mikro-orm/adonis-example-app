import { MikroORM, EntityManager } from '@mikro-orm/sqlite'
import type { ApplicationService } from '@adonisjs/core/types'
import config from '#config/mikro-orm.config'
import { UserRepository } from '#repositories/user_repository'
import { ArticleRepository } from '#repositories/article_repository'
import { UserSchema } from '#entities/user'
import { ArticleSchema } from '#entities/article'
import { TestSeeder } from '#database/seeders/test_seeder'

export default class MikroOrmProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton(MikroORM, () => {
      return new MikroORM(config)
    })

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

  async boot() {
    const orm = await this.app.container.make(MikroORM)

    if (this.app.inTest) {
      // in tests, use in-memory DB with fresh schema and seed data
      await orm.schema.create()
      await orm.seeder.seed(TestSeeder)
    } else {
      // for simplicity, we use `schema.update()` to auto-create/update tables
      // in production, use `orm.migrator.up()` with proper migrations instead
      await orm.schema.update()
    }
  }

  async shutdown() {
    const orm = await this.app.container.make(MikroORM)
    await orm.close()
  }
}
