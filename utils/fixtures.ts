import { APILogger } from './logger'
import {RequestHandler} from './request-handlers'
import {test as base} from '@playwright/test'
import {config} from './api-test.config'

type TestOptions = {
    api: RequestHandler,
    config:typeof config
}

export const test = base.extend<TestOptions>({
    api: async ({request}, use)=> {
        const logger = new APILogger()
        const requestHandler = new RequestHandler(request, config.apiUrl, logger)
        await use(requestHandler)
    },

    config:async ({}, use) =>{
        await use(config)
    } 
})