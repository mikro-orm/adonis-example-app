import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { wrap, type EntityData } from '@mikro-orm/core'
import { EntityManager } from '@mikro-orm/sqlite'
import { type IArticle } from '#entities/article'
import { CommentSchema } from '#entities/comment'
import { type User } from '#entities/user'
import { AuthError } from '#repositories/user_repository'
import { ArticleRepository } from '#repositories/article_repository'

function getUserFromCtx(ctx: HttpContext): User {
  if (!ctx.user) {
    throw new AuthError('Please provide your token via Authorization header')
  }

  return ctx.user as User
}

function verifyArticlePermissions(user: User, article: IArticle) {
  if (article.author.id !== user.id) {
    throw new AuthError('You are not the author of this article!')
  }
}

@inject()
export default class ArticlesController {
  constructor(
    protected em: EntityManager,
    protected articleRepo: ArticleRepository,
  ) {}

  async index({ request }: HttpContext) {
    const limit = request.input('limit')
    const offset = request.input('offset')

    const { items, total } = await this.articleRepo.listArticles({
      limit, offset,
    })

    return { items, total }
  }

  async show({ params }: HttpContext) {
    return this.articleRepo.findOneOrFail({ slug: params.slug }, {
      populate: ['author', 'comments.author', 'text'],
    })
  }

  async store(ctx: HttpContext) {
    const author = getUserFromCtx(ctx)
    const { title, description, text } = ctx.request.body()

    const article = this.articleRepo.create({
      title, description, text,
      author,
    })

    await this.em.flush()

    return article
  }

  async update(ctx: HttpContext) {
    const user = getUserFromCtx(ctx)
    const article = await this.articleRepo.findOneOrFail(+ctx.params.id)
    verifyArticlePermissions(user, article)
    wrap(article).assign(ctx.request.body() as EntityData<IArticle>)
    await this.em.flush()

    return article
  }

  async destroy(ctx: HttpContext) {
    const user = getUserFromCtx(ctx)
    const article = await this.articleRepo.findOne(+ctx.params.id)

    if (!article) {
      return { notFound: true }
    }

    verifyArticlePermissions(user, article)
    await this.em.remove(article).flush()

    return { success: true }
  }

  async addComment(ctx: HttpContext) {
    const author = getUserFromCtx(ctx)
    const article = await this.articleRepo.findOneOrFail({ slug: ctx.params.slug })
    const { text } = ctx.request.body()
    const comment = this.em.create(CommentSchema, { author, article, text })

    article.comments.add(comment)
    await this.em.flush()

    return comment
  }
}
