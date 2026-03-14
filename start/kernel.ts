import router from '@adonisjs/core/services/router'
import server from '@adonisjs/core/services/server'

server.errorHandler(() => import('#exceptions/handler'))

server.use([
  () => import('#middleware/container_bindings_middleware'),
  () => import('#middleware/mikro_orm_middleware'),
])

router.use([() => import('@adonisjs/core/bodyparser_middleware')])

router.use([() => import('#middleware/auth_middleware')])
