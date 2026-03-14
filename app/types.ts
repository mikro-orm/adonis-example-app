import type { User } from '#entities/user'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    user?: User
  }
}
