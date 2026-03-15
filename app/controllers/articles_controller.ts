import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { wrap } from '@mikro-orm/core'
import { EntityManager } from '@mikro-orm/sqlite'
import { CommentSchema } from '#entities/comment'
import { AuthError } from '#repositories/user_repository'
import { ArticleRepository } from '#repositories/article_repository'
import { type IArticle } from '#entities/article'

function verifyArticlePermissions(user: { id: number }, article: IArticle) {
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

  async store({ auth, request }: HttpContext) {
    const author = auth.getUserOrFail()
    const { title, description, text } = request.body()

    const article = this.articleRepo.create({
      title, description, text,
      author,
    })

    await this.em.flush()

    return article
  }

  async update({ auth, params, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const article = await this.articleRepo.findOneOrFail(+params.id)
    verifyArticlePermissions(user, article)
    const body = request.body()
    const data: Record<string, unknown> = {}

    for (const key of ['title', 'description', 'text'] as const) {
      if (body[key] !== undefined) {
        data[key] = body[key]
      }
    }

    wrap(article).assign(data)
    await this.em.flush()

    return article
  }

  async destroy({ auth, params }: HttpContext) {
    const user = auth.getUserOrFail()
    const article = await this.articleRepo.findOneOrFail(+params.id)
    verifyArticlePermissions(user, article)
    await this.em.remove(article).flush()

    return { success: true }
  }

  async addComment({ auth, params, request }: HttpContext) {
    const author = auth.getUserOrFail()
    const article = await this.articleRepo.findOneOrFail({ slug: params.slug })
    const { text } = request.body()
    const comment = this.em.create(CommentSchema, { author, article, text })
    await this.em.flush()

    return comment
  }
}
