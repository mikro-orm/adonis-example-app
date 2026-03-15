import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors as authErrors } from '@adonisjs/auth'
import { NotFoundError } from '@mikro-orm/core'
import { AuthError } from '#repositories/user_repository'

export default class HttpExceptionHandler extends ExceptionHandler {
  protected debug = !app.inProduction

  async handle(error: unknown, ctx: HttpContext) {
    if (error instanceof authErrors.E_UNAUTHORIZED_ACCESS) {
      ctx.response.status(401).send({ error: 'Unauthorized' })
      return
    }

    if (error instanceof AuthError) {
      ctx.response.status(401).send({ error: error.message })
      return
    }

    if (error instanceof NotFoundError) {
      ctx.response.status(404).send({ error: error.message })
      return
    }

    return super.handle(error, ctx)
  }

  async report(error: unknown, ctx: HttpContext) {
    if (error instanceof authErrors.E_UNAUTHORIZED_ACCESS || error instanceof AuthError) {
      return
    }

    return super.report(error, ctx)
  }
}
