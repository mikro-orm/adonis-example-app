import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { wrap, type EntityData } from '@mikro-orm/core'
import { EntityManager } from '@mikro-orm/sqlite'
import { type User } from '#entities/user'
import { signJwt } from '#services/jwt'
import { AuthError, UserRepository } from '#repositories/user_repository'

function getUserFromCtx(ctx: HttpContext): User {
  if (!ctx.user) {
    throw new AuthError('Please provide your token via Authorization header')
  }

  return ctx.user as User
}

@inject()
export default class UsersController {
  constructor(
    protected em: EntityManager,
    protected userRepo: UserRepository,
  ) {}

  async signUp({ request, response }: HttpContext) {
    const body = request.body()

    if (await this.userRepo.exists(body.email)) {
      return response.badRequest({
        error: 'This email is already registered, maybe you want to sign in?',
      })
    }

    const user = this.userRepo.create(body as any)
    await this.em.flush()

    user.token = signJwt({ id: user.id })

    return user
  }

  async signIn({ request, response }: HttpContext) {
    const { email, password } = request.body()

    try {
      const user = await this.userRepo.login(email, password)
      user.token = signJwt({ id: user.id })
      return user
    } catch (error) {
      if (error instanceof AuthError) {
        return response.unauthorized({ error: error.message })
      }

      throw error
    }
  }

  async profile(ctx: HttpContext) {
    return getUserFromCtx(ctx)
  }

  async updateProfile(ctx: HttpContext) {
    const user = getUserFromCtx(ctx)
    wrap(user).assign(ctx.request.body() as EntityData<User>)
    await this.em.flush()
    return user
  }
}
