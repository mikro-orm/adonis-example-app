import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { wrap } from '@mikro-orm/core'
import { EntityManager } from '@mikro-orm/sqlite'
import { signJwt } from '#services/jwt'
import { AuthError, UserRepository } from '#repositories/user_repository'
import { getUserFromCtx } from '#utils/auth'

@inject()
export default class UsersController {
  constructor(
    protected em: EntityManager,
    protected userRepo: UserRepository,
  ) {}

  async signUp({ request, response }: HttpContext) {
    const { fullName, email, password, bio } = request.body()

    if (await this.userRepo.exists(email)) {
      return response.badRequest({
        error: 'This email is already registered, maybe you want to sign in?',
      })
    }

    const user = this.userRepo.create({ fullName, email, password, bio })
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
    const body = ctx.request.body()
    const data: Record<string, unknown> = {}

    for (const key of ['fullName', 'bio', 'social'] as const) {
      if (body[key] !== undefined) {
        data[key] = body[key]
      }
    }

    wrap(user).assign(data)
    await this.em.flush()
    return user
  }
}
