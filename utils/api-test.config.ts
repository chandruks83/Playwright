const processENV = process.env.TEST_ENV
const env =processENV || 'qa'

const config={
    apiUrl: 'https://conduit-api.bondaracademy.com/api',
    userEmail: "apitest@play.com",
    userPwd: "ApiTest123"
}

export {config}

if (env === 'qa'){
    config.userEmail = "apitest@play.com",
    config.userPwd = "ApiTest123"
}