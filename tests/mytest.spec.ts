import { test, expect } from "@playwright/test";
import { request } from "http";
let authtoken: string
let url = 'https://conduit-api.bondaracademy.com/api/'

test.beforeAll('Login', async ({ request }) => {
    const loginResponse = await request.post(url + 'users/login',
        { data: { "user": { "email": "apitest@play.com", "password": "ApiTest123" } } })
    const loginResponseJson = await loginResponse.json()
    authtoken = 'Token ' + loginResponseJson.user.token
})

test("POST Article", async ({ request }) => {
    const postArticle = await request.post(url + 'articles/', {
        data: { "article": { "title": "Test2", "description": "test", "body": "test", "tagList": ["tag1"] } },
        headers: { authorization: authtoken }
    })
    const postArticleJson = await postArticle.json()
    const slugId = postArticleJson.article.slug
    const articleUrl = url + 'articles/' + slugId

    const getArticle = await request.get(articleUrl, { headers: { authorization: authtoken } })
    const getArticleJson = await getArticle.json()
    expect(getArticleJson.article.title).toEqual('Test2')

    const commentsUrl = articleUrl + '/comments/'
    const postComment = await request.post(commentsUrl, { data: { "comment": { "body": "A comment" } }, headers: { authorization: authtoken } })

    const getComment = await request.get(commentsUrl, {headers: { authorization: authtoken }} )
    const getCommentJson = await getComment.json()
    expect(getCommentJson.comments[0].body).toEqual('A comment')

    const favoriteUrl = articleUrl + '/favorite'
    await request.post(favoriteUrl, {headers: { authorization: authtoken }})

    const favoriteResponse = await request.get(articleUrl, {headers: { authorization: authtoken }})
    const favoriteResponseJson = await favoriteResponse.json()
    expect(favoriteResponseJson.article.favorited).toEqual(true)

    const editArticle = await request.put(articleUrl, {data: 
        {"article":{"title":"Test5","description":"t5","body":"t5","tagList":
            ["t5"],"slug":slugId}}, headers: { authorization: authtoken }})
    const editArticleJson = await editArticle.json()
    const newUrl = url + 'articles/'+ editArticleJson.article.slug

    const getEditedArticle = await request.get(newUrl, {headers: { authorization: authtoken }})
    const getEditedArticleJson = await getEditedArticle.json()
    expect(getEditedArticleJson.article.title).toEqual('Test5')
    
    await request.delete(newUrl, {headers:{ authorization: authtoken }})

})

test('POST comments', async ({ request }) => {
    const postComments = await request.post(url + 'articles/Test1-41678/comments', {
        data: {
            "comment": {
                "body": "c"
            }
        }, headers: { authorization: authtoken }
    })
    const postCommentsJson = await postComments.json()
}
)

test('GET comments', async ({ request }) => {
    const response = await request.get(url + "articles/Test1-41678/comments/", { headers: { authorization: authtoken } })
    const responseJson = await response.json()
    for (const comment of responseJson.comments) {
        const url1 = `${url}articles/Test1-41678/comments/${comment.id}/`
        await request.delete(url1, { headers: { authorization: authtoken } });
    }
    const deletedResponse = await request.get(url + "articles/Test1-41678/comments/", { headers: { authorization: authtoken } })
    const deletedResponseJson = await deletedResponse.json()
    expect(deletedResponseJson.comments.length).toEqual(0)
});

test('POST favorite', async ({ request }) => {
    await request.post(url + 'articles/Test1-41678/favorite', { headers: { authorization: authtoken } })
    const favorite = await request.get(url + 'articles/Test1-41678/', { headers: { authorization: authtoken } })
    const favoriteJson = await favorite.json()
    expect(favoriteJson.article.favorited).toBe(true)

    await request.delete(url + 'articles/Test1-41678/favorite', { headers: { authorization: authtoken } })
    const deleteFavorite = await request.get(url + 'articles/Test1-41678/', { headers: { authorization: authtoken } })
    const deleteFavoriteJson = await deleteFavorite.json()
    expect(deleteFavoriteJson.article.favorited).toBe(false)
}
)