import app from '@adonisjs/core/services/app'
import { defineConfig, stores } from '@adonisjs/session'

const sessionConfig = defineConfig({
  age: '2h',
  store: app.inTest ? 'memory' : 'cookie',
  cookie: {},
  stores: {
    cookie: stores.cookie(),
  },
})

export default sessionConfig
