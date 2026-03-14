import { defineEntity, type InferEntity, p } from '@mikro-orm/core'
import { BaseSchema } from '#entities/base'
import { ArticleSchema } from '#entities/article'

export const TagSchema = defineEntity({
  name: 'Tag',
  extends: BaseSchema,
  properties: {
    name: p.string().length(20),
    articles: () => p.manyToMany(ArticleSchema).mappedBy('tags'),
  },
})

export type ITag = InferEntity<typeof TagSchema>
