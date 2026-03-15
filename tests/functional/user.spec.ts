import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import { MikroORM } from '@mikro-orm/sqlite'
import { User } from '#entities/user'

test.group('User', () => {
  test('sign in with valid credentials', async ({ client }) => {
    const response = await client.post('/user/sign-in').json({
      email: 'foo@bar.com',
      password: 'password123',
    })

    response.assertStatus(200)
    response.assertBodyContains({ fullName: 'Foo Bar' })
  })

  test('sign in with wrong password', async ({ client }) => {
    const response = await client.post('/user/sign-in').json({
      email: 'foo@bar.com',
      password: 'wrong-password',
    })

    response.assertStatus(401)
    response.assertBodyContains({ error: 'Invalid combination of email and password' })
  })

  test('sign up and get profile', async ({ client }) => {
    const signUpResponse = await client.post('/user/sign-up').json({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'test-password',
    })

    signUpResponse.assertStatus(200)
    signUpResponse.assertBodyContains({ fullName: 'Test User' })

    // use loginAs with the newly created user
    const orm = await app.container.make(MikroORM)
    const user = await orm.em.fork().findOneOrFail(User, { email: 'test@example.com' })
    const profileResponse = await client.get('/user/profile').loginAs(user)

    profileResponse.assertStatus(200)
    profileResponse.assertBodyContains({ fullName: 'Test User' })
  })

  test('update profile', async ({ client, assert }) => {
    const orm = await app.container.make(MikroORM)
    const user = await orm.em.fork().findOneOrFail(User, { email: 'foo@bar.com' })

    const response = await client.patch('/user/profile').loginAs(user).json({
      bio: 'Updated bio text',
    })

    response.assertStatus(200)
    assert.equal(response.body().bio, 'Updated bio text')
  })
})
