import { defineConfig } from '@mikro-orm/sqlite'
import { UserSchema, SocialSchema } from '#entities/user'
import { ArticleSchema } from '#entities/article'
import { ArticleListingSchema } from '#entities/article_listing'
import { TagSchema } from '#entities/tag'
import { CommentSchema } from '#entities/comment'
import { SeedManager } from '@mikro-orm/seeder'
import { Migrator } from '@mikro-orm/migrations'
import { SoftDeleteSubscriber } from '#subscribers/soft_delete'

export default defineConfig({
  dbName: process.env.NODE_ENV === 'test' ? ':memory:' : 'sqlite.db',
  entities: [UserSchema, SocialSchema, ArticleSchema, ArticleListingSchema, TagSchema, CommentSchema],
  debug: process.env.NODE_ENV !== 'test',
  extensions: [SeedManager, Migrator],
  subscribers: [new SoftDeleteSubscriber()],
})
