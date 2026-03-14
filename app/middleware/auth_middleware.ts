import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { UserRepository } from '#repositories/user_repository'
import { verifyJwt } from '#services/jwt'

/**
 * Attempts to authenticate the user from the Authorization header.
 * Does not reject unauthenticated requests — just sets `ctx.user` if valid.
 */
@inject()
export default class AuthMiddleware {
  constructor(protected userRepo: UserRepository) {}

  async handle(ctx: HttpContext, next: NextFn) {
    const header = ctx.request.header('authorization')

    if (header?.startsWith('Bearer ')) {
      const token = header.slice(7)

      try {
        const payload = verifyJwt(token)
        ctx.user = await this.userRepo.findOneOrFail(payload.id)
      } catch {
        // ignore invalid tokens, we validate ctx.user where needed
      }
    }

    return next()
  }
}
