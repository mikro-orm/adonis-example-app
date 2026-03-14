import router from '@adonisjs/core/services/router'

const UsersController = () => import('#controllers/users_controller')
const ArticlesController = () => import('#controllers/articles_controller')

// user routes
router.post('/user/sign-up', [UsersController, 'signUp'])
router.post('/user/sign-in', [UsersController, 'signIn'])
router.get('/user/profile', [UsersController, 'profile'])
router.patch('/user/profile', [UsersController, 'updateProfile'])

// article routes
router.get('/article', [ArticlesController, 'index'])
router.get('/article/:slug', [ArticlesController, 'show'])
router.post('/article', [ArticlesController, 'store'])
router.patch('/article/:id', [ArticlesController, 'update'])
router.delete('/article/:id', [ArticlesController, 'destroy'])
router.post('/article/:slug/comment', [ArticlesController, 'addComment'])
