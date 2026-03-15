import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import { MikroORM } from '@mikro-orm/sqlite'
import { User } from '#entities/user'

async function getTestUser() {
  const orm = await app.container.make(MikroORM)
  return orm.em.fork().findOneOrFail(User, { email: 'foo@bar.com' })
}

test.group('Article', () => {
  test('list all articles', async ({ client, assert }) => {
    const response = await client.get('/article')

    response.assertStatus(200)
    assert.equal(response.body().total, 3)
    assert.equal(response.body().items[0].title, 'title 1/3')
    assert.deepInclude(response.body().items[0].tags, 'foo1')
  })

  test('get article detail', async ({ client, assert }) => {
    const listResponse = await client.get('/article')
    const slug = listResponse.body().items[0].slug

    const response = await client.get(`/article/${slug}`)

    response.assertStatus(200)
    assert.equal(response.body().title, 'title 1/3')
    assert.equal(response.body().text, 'text text text 1/3')
    assert.lengthOf(response.body().comments, 2)
  })

  test('create article requires auth', async ({ client }) => {
    const response = await client.post('/article').json({
      title: 'New Article',
      text: 'Article content',
    })

    response.assertStatus(401)
    response.assertBodyContains({ error: 'Unauthorized' })
  })

  test('create article with auth', async ({ client, assert }) => {
    const user = await getTestUser()

    const response = await client.post('/article').loginAs(user).json({
      title: 'Brand New Article',
      text: 'Some interesting content here',
    })

    response.assertStatus(200)
    assert.equal(response.body().title, 'Brand New Article')
    assert.equal(response.body().slug, 'brand-new-article')
  })

  test('update article', async ({ client, assert }) => {
    const user = await getTestUser()

    // get the article ID via the detail endpoint
    const list = await client.get('/article')
    const slug = list.body().items[0].slug
    const detail = await client.get(`/article/${slug}`)
    const articleId = detail.body().id

    const response = await client.patch(`/article/${articleId}`).loginAs(user).json({
      title: 'Updated Title',
    })

    response.assertStatus(200)
    assert.equal(response.body().title, 'Updated Title')
  })

  test('delete article', async ({ client, assert }) => {
    const user = await getTestUser()

    const list = await client.get('/article')
    const totalBefore = list.body().total
    const slug = list.body().items[totalBefore - 1].slug
    const detail = await client.get(`/article/${slug}`)
    const articleId = detail.body().id

    const response = await client.delete(`/article/${articleId}`).loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const listAfter = await client.get('/article')
    assert.equal(listAfter.body().total, totalBefore - 1)
  })

  test('add comment to article', async ({ client, assert }) => {
    const user = await getTestUser()

    const list = await client.get('/article')
    const slug = list.body().items[0].slug

    const response = await client.post(`/article/${slug}/comment`).loginAs(user).json({
      text: 'Great article!',
    })

    response.assertStatus(200)
    assert.equal(response.body().text, 'Great article!')
  })
})
