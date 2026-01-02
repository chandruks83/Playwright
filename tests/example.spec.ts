import { test, expect } from '@playwright/test';
import {APILogger} from '../utils/logger'

let authToken: string

test.beforeAll('run before all', async ({request})=>{
    const responseLogin = await request.post("https://conduit-api.bondaracademy.com/api/users/login", {
      data: { "user": { "email": "apitest@play.com", "password": "ApiTest123" } }
    })
    const responseLoginJson = await responseLogin.json()
    authToken = "Token " + responseLoginJson.user.token
})

test('Get Test Tags', async ({ request }) => {
  const responseArticle = await request.get("https://conduit-api.bondaracademy.com/api/tags")
  const responseArticleJson = await responseArticle.json()
  expect(responseArticle.status()).toEqual(200);
  expect(responseArticleJson.tags.length).toBeLessThanOrEqual(10);
});

test('Get All articles', async ({ request }) => {
  const responseArticles = await request.get("https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0")
  const responseArticlesJson = await responseArticles.json()
  const slug = responseArticlesJson.articles[0].slug
  expect(slug).toContain('Bondar')
  expect(responseArticlesJson.articlesCount).toBeLessThanOrEqual(10);
});

test('Post article', async ({ request }) => {

  const postArticle = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: { "article": { "title": "Test1", "description": "t", "body": "t", "tagList": [] } },
    headers: { authorization: authToken }
  })
  expect(postArticle.status()).toEqual(201)

  const postArticleJson = await postArticle.json()
  expect(postArticleJson.article.title).toBe("Test1")

  const getArticles = await request.get("https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0", {
    headers: { authorization: authToken }
  }
  )
  expect(getArticles.status()).toEqual(200)
  const getArticlesJson = await getArticles.json()
  expect(getArticlesJson.articles[0].title).toEqual("Test1")

  const slug = getArticlesJson.articles[0].slug

  const deleteRequst = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slug}`, { headers: { authorization: authToken } })
  expect(deleteRequst.status()).toEqual(204)

})

test("Put request", async ({ request }) => {

  const postArticle1 = await request.post("https://conduit-api.bondaracademy.com/api/articles/", {
    data: {
      "article": {
        "title": "Test1",
        "description": "t",
        "body": "t",
        "tagList": []
      }
    }, headers: { authorization: authToken }
  })

  expect(postArticle1.status()).toEqual(201)
  const postArticleJson1 = await postArticle1.json()
  const slug = postArticleJson1.article.slug

  const getResponse1 = await request.get("https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0", {
    headers: { authorization: authToken }
  })
  expect(getResponse1.status()).toEqual(200)
  const getResponseJson1 = await getResponse1.json()
  expect(getResponseJson1.articles[0].title).toEqual("Test1")

  const putRequest = await request.put(`https://conduit-api.bondaracademy.com/api/articles/${slug}`, {
    data: {
      "article": {
        "title": "Test3",
        "description": "t",
        "body": "t",
        "tagList": [],
      }
    }, headers: { authorization: authToken }
  })

  const putRequestJson = await putRequest.json()
  expect(putRequest.status()).toEqual(200)

  const modifiedRequest = await request.get(`https://conduit-api.bondaracademy.com/api/articles/`, 
    { headers: { authorization: authToken } })

  expect((modifiedRequest).status()).toEqual(200)

  const modifiedRequestJson = await modifiedRequest.json()
  expect(modifiedRequestJson.articles[0].title).toEqual('Test3')
  const slug1 = modifiedRequestJson.articles[0].slug
  const deleteRequst = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slug1}`, { headers: { authorization: authToken } })
  expect(deleteRequst.status()).toEqual(204)
})

test('logger', async ({ request }) => {
  const logger = new APILogger()
  const responseArticle = await request.get("https://conduit-api.bondaracademy.com/api/tags")
  logger.logRequest('get',"https://conduit-api.bondaracademy.com/", {Authorization:authToken})
  const responseArticleJson = await responseArticle.json()
  logger.logResponse(responseArticle.status(), responseArticleJson)
  expect(responseArticle.status()).toEqual(200);
  expect(responseArticleJson.tags.length).toBeLessThanOrEqual(10);
  console.log(logger.getRecentlogs())
});