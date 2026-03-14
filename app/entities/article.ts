import { defineEntity, type InferEntity, p } from '@mikro-orm/core'
import { BaseSchema } from '#entities/base'
import { UserSchema } from '#entities/user'
import { CommentSchema } from '#entities/comment'
import { TagSchema } from '#entities/tag'
import { ArticleRepository } from '#repositories/article_repository'

function convertToSlug(title: string) {
  return title.toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export const ArticleSchema = defineEntity({
  name: 'Article',
  extends: BaseSchema,
  repository: () => ArticleRepository,
  properties: {
    slug: p.string().unique().onCreate(article => convertToSlug(article.title)),
    title: p.string().index(),
    description: p.string().length(1000).onCreate(article => article.text.substring(0, 999) + '…'),
    text: p.text().lazy(),
    author: () => p.manyToOne(UserSchema).ref(),
    tags: () => p.manyToMany(TagSchema),
    comments: () => p.oneToMany(CommentSchema).mappedBy('article').eager().orphanRemoval(),
  },
})

export type IArticle = InferEntity<typeof ArticleSchema>
