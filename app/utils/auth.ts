import type { HttpContext } from '@adonisjs/core/http'
import { type User } from '#entities/user'
import { AuthError } from '#repositories/user_repository'

export function getUserFromCtx(ctx: HttpContext): User {
  if (!ctx.user) {
    throw new AuthError('Please provide your token via Authorization header')
  }

  return ctx.user as User
}
