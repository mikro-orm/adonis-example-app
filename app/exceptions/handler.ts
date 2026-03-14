import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { NotFoundError } from '@mikro-orm/core'

export default class HttpExceptionHandler extends ExceptionHandler {
  protected debug = !app.inProduction

  async handle(error: unknown, ctx: HttpContext) {
    // handle MikroORM's NotFoundError (from `findOneOrFail`)
    if (error instanceof NotFoundError) {
      ctx.response.status(404).send({ error: error.message })
      return
    }

    return super.handle(error, ctx)
  }

  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
