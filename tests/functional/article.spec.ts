import { test } from '@japa/runner'

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
    response.assertBodyContains({ error: 'Please provide your token via Authorization header' })
  })
})
