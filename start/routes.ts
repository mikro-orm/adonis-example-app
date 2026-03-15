import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const UsersController = () => import('#controllers/users_controller')
const ArticlesController = () => import('#controllers/articles_controller')

// public routes
router.post('/user/sign-up', [UsersController, 'signUp'])
router.post('/user/sign-in', [UsersController, 'signIn'])
router.get('/article', [ArticlesController, 'index'])
router.get('/article/:slug', [ArticlesController, 'show'])

// protected routes
router.group(() => {
  router.get('/user/profile', [UsersController, 'profile'])
  router.patch('/user/profile', [UsersController, 'updateProfile'])
  router.post('/article', [ArticlesController, 'store'])
  router.patch('/article/:id', [ArticlesController, 'update'])
  router.delete('/article/:id', [ArticlesController, 'destroy'])
  router.post('/article/:slug/comment', [ArticlesController, 'addComment'])
}).use(middleware.auth())
