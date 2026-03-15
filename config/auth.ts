import { defineConfig } from '@adonisjs/auth'
import { sessionGuard } from '@adonisjs/auth/session'
import { configProvider } from '@adonisjs/core'
import { EntityManager } from '@mikro-orm/sqlite'
import type { InferAuthenticators } from '@adonisjs/auth/types'

const authConfig = defineConfig({
  default: 'web',
  guards: {
    web: sessionGuard({
      useRememberMeTokens: false,
      provider: configProvider.create(async (app) => {
        const { MikroOrmUserProvider } = await import('#auth/mikro_orm_user_provider')
        const em = await app.container.make(EntityManager)
        return new MikroOrmUserProvider(em)
      }),
    }),
  },
})

export default authConfig

declare module '@adonisjs/auth/types' {
  interface Authenticators extends InferAuthenticators<typeof authConfig> {}
}
