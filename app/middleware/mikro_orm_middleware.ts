import { RequestContext } from '@mikro-orm/core'
import { MikroORM } from '@mikro-orm/sqlite'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Creates a new MikroORM RequestContext for each HTTP request,
 * ensuring each request gets its own identity map.
 */
@inject()
export default class MikroOrmMiddleware {
  constructor(protected orm: MikroORM) {}

  handle(_ctx: HttpContext, next: NextFn) {
    return RequestContext.create(this.orm.em, () => next())
  }
}
