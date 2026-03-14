import { type FindOptions, sql, EntityRepository } from '@mikro-orm/sqlite'
import { type IArticle, ArticleSchema } from '#entities/article'
import { type IArticleListing, ArticleListingSchema } from '#entities/article_listing'
import { CommentSchema } from '#entities/comment'

export class ArticleRepository extends EntityRepository<IArticle> {

  listArticlesQuery() {
    const totalComments = this.em.createQueryBuilder(CommentSchema)
      .count()
      .where({ article: sql.ref('a.id') })
      .as('totalComments')

    const usedTags = this.em.createQueryBuilder(ArticleSchema, 'aa')
      .select(sql`group_concat(distinct t.name)`)
      .join('aa.tags', 't')
      .where({ 'aa.id': sql.ref('a.id') })
      .groupBy('aa.author')
      .as('tags')

    return this.createQueryBuilder('a')
      .select(['slug', 'title', 'description', 'author'])
      .addSelect(sql.ref('u.full_name').as('authorName'))
      .join('author', 'u')
      .addSelect([totalComments, usedTags])
  }

  async listArticles(options: FindOptions<IArticleListing>) {
    const [items, total] = await this.em.findAndCount(ArticleListingSchema, {}, options)
    return { items, total }
  }

}
