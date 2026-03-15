import { symbols } from '@adonisjs/auth'
import type { SessionGuardUser, SessionUserProviderContract } from '@adonisjs/auth/types/session'
import type { EntityManager } from '@mikro-orm/sqlite'
import { User } from '#entities/user'

/**
 * Bridges MikroORM with the AdonisJS session guard.
 * Implements SessionUserProviderContract so the auth system
 * can look up users via MikroORM's EntityManager.
 */
export class MikroOrmUserProvider implements SessionUserProviderContract<User> {
  declare [symbols.PROVIDER_REAL_USER]: User

  constructor(private em: EntityManager) {}

  async createUserForGuard(user: User): Promise<SessionGuardUser<User>> {
    return {
      getId() {
        return user.id
      },
      getOriginal() {
        return user
      },
    }
  }

  async findById(identifier: number): Promise<SessionGuardUser<User> | null> {
    const user = await this.em.findOne(User, identifier)

    if (!user) {
      return null
    }

    return this.createUserForGuard(user)
  }
}
