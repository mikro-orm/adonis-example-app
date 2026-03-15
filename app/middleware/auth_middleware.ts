import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'

/**
 * Protects routes from unauthenticated users. Throws E_UNAUTHORIZED_ACCESS
 * when the user is not logged in.
 */
export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options: { guards?: (keyof Authenticators)[] } = {}) {
    await ctx.auth.authenticateUsing(options.guards || [ctx.auth.defaultGuard])
    return next()
  }
}
