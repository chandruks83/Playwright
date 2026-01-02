import { expect } from '@playwright/test'
import {test} from '../utils/fixtures'

let authToken: string

test.beforeAll('run before all', async ({api, config})=>{
    const tokenResponse = await api
        .path('/users/login')
        .body({ "user": { "email": config.userEmail, "password": config.userPwd } })
        .postRequest(200)
    authToken = "Token " + tokenResponse.user.token
    console.log(tokenResponse.user)
})

test('Get articles', async({api}) =>{
    
    const response = await api
        .path('/articles')
        .params({limit:10, offset:0})
        .getRequest(200)
    expect(response.articlesCount).toBeLessThanOrEqual(10)
})

test('Get tags', async ({api}) =>{
    const response = await api
        .path('/tags')
        .getRequest(200)
    expect(response.tags.length).toBeLessThanOrEqual(10)
})

test('create and delete article', async({api}) =>{
    const createArticleresponse = await api
        .path('/articles/')
        .body({ "article": { "title": "Test1", "description": "t", "body": "t", "tagList": [] } })
        .headers({ authorization: authToken})
        .postRequest(201)
    expect(createArticleresponse.article.title).toEqual('Test1')

    const getArticleresponse = await api
        .path('/articles')
        .params({limit:10, offset:0})
        .getRequest(200)
    expect(getArticleresponse.articles[0].title).toEqual("Test1")

    const slug = getArticleresponse.articles[0].slug

    const deleteArticleresponse = await api
        .path(`/articles/${slug}`)
        .headers({ authorization: authToken})
        .deleteRequest(204)

    const getDeletedArticleresponse = await api
        .path('/articles')
        .params({limit:10, offset:0})
        .getRequest(200)
    expect(getDeletedArticleresponse.articles[0].title).not.toEqual("Test1")
})


test('create Update and delete article', async({api}) =>{
    const createArticleresponse = await api
        .path('/articles/')
        .body({ "article": { "title": "Test1", "description": "t", "body": "t", "tagList": [] } })
        .headers({ authorization: authToken})
        .postRequest(201)
    const postSlugId = createArticleresponse.article.slug

    const getArticleresponse = await api
        .path('/articles')
        .params({limit:10, offset:0})
        .getRequest(200)
    expect(getArticleresponse.articles[0].title).toEqual("Test1")

    const updateArticleresponse = await api
        .path(`/articles/${postSlugId}`)
        .body({ "article": { "title": "Test2", "description": "t", "body": "t", "tagList": [] } })
        .headers({ authorization: authToken})
        .putRequest(200)
    expect(updateArticleresponse.article.title).toEqual('Test2')

    const getUpdatedArticleresponse = await api
        .path('/articles')
        .params({limit:10, offset:0})
        .getRequest(200)
    expect(getUpdatedArticleresponse.articles[0].title).toEqual("Test2")

    const slug = getUpdatedArticleresponse.articles[0].slug

    const deleteArticleresponse = await api
        .path(`/articles/${slug}`)
        .headers({ authorization: authToken})
        .deleteRequest(204)

    const getDeletedArticleresponse = await api
        .path('/articles')
        .params({limit:10, offset:0})
        .getRequest(200)
    expect(getDeletedArticleresponse.articles[0].title).not.toEqual("Test2")
})