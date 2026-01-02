import { APIRequestContext, expect } from "@playwright/test"
import { APILogger } from "./logger"
import { test } from '@playwright/test'

export class RequestHandler {

    private request: APIRequestContext
    private logger: APILogger
    private baseUrl: string | undefined
    private defaultBaseUrl: string
    private apiPath: string = ''
    private queryParams: object = {}
    private apiBody: object = {}
    private apiHeaders: Record<string, string> = {}

    constructor(request: APIRequestContext, apiBaseUrl: string, logger: APILogger) {
        this.request = request
        this.defaultBaseUrl = apiBaseUrl
        this.logger = logger
    }

    url(url: string) {
        this.baseUrl = url // keyword "this" will return the instance of same class we are working with, "this" will give access to the methods and instance variables of the class
        return this       //this is called fluent interface design, where we provide access of methods to other methods to chain
    }

    path(path: string) {
        this.apiPath = path
        return this
    }

    params(params: object) {
        this.queryParams = params
        return this
    }

    body(body: object) {
        this.apiBody = body
        return this
    }

    headers(headers: Record<string, string>) {
        this.apiHeaders = headers
        return this
    }

    async getRequest(statusCode: number) {
        let responseJson: any
        const url = this.getUrl()
        await test.step(`GET request to: ${url}`, async () => {
            this.logger.logRequest('GET', url, this.apiHeaders, this.apiBody)
            const response = await this.request.get(url, {
                headers: this.apiHeaders
            })
            this.cleanUpFields()

            const actualStatus = response.status()
            const responseJson = await response.json()

            this.logger.logResponse(actualStatus, responseJson)
            this.statusCodeValidator(actualStatus, statusCode, this.getRequest)
        })

        return responseJson
    }

    async postRequest(statusCode: number) {
        let responseJson: any
        const url = this.getUrl()
        await test.step(`POST request to: ${url}`, async () => {
            this.logger.logRequest('POST', url, this.apiHeaders, this.apiBody)
            const response = await this.request.post(url, {
                headers: this.apiHeaders,
                data: this.apiBody
            })
            this.cleanUpFields()
            const actualStatus = response.status()
            const responseJson = await response.json()

            this.logger.logResponse(actualStatus, responseJson)
            this.statusCodeValidator(actualStatus, statusCode, this.postRequest)
        })


        return responseJson
    }

    async putRequest(statusCode: number) {
        let responseJson: any
        const url = this.getUrl()
        await test.step(`PUT request to:${url}`, async () => {
            this.logger.logRequest('PUT', url, this.apiHeaders, this.apiBody)
            const response = await this.request.put(url, {
                headers: this.apiHeaders,
                data: this.apiBody
            })
            this.cleanUpFields()
            const actualStatus = response.status()
            const responseJson = await response.json()

            this.logger.logResponse(actualStatus, responseJson)
            this.statusCodeValidator(actualStatus, statusCode, this.putRequest)
        })

        return responseJson
    }

    async deleteRequest(statusCode: number) {

        const url = this.getUrl()
        await test.step(`DELETE request :${url}`, async()=> {
            this.logger.logRequest('DELETE', url, this.apiHeaders, this.apiBody)
            const response = await this.request.delete(url, {
                headers: this.apiHeaders
            })
            this.cleanUpFields()
            const actualStatus = response.status()

            this.logger.logResponse(actualStatus)
            this.statusCodeValidator(actualStatus, statusCode, this.deleteRequest)
        })  
    }

    private getUrl() {
        const url = new URL(`${this.baseUrl ?? this.defaultBaseUrl}${this.apiPath}`)
        for (const [key, value] of Object.entries(this.queryParams))
            url.searchParams.append(key, value)
        return url.toString()
    }

    private statusCodeValidator(actualStatus: number, expectedStatus: number, callingMethod: Function) {
        if (actualStatus !== expectedStatus) {
            const logs = this.logger.getRecentlogs()
            const error = new Error(`Expected status: ${expectedStatus}\n \t   Actual status  : ${actualStatus}\n\nAPI activity:\n${logs}`)
            Error.captureStackTrace(error, callingMethod)
            throw error
        }
    }

    private cleanUpFields() {
        this.baseUrl = undefined
        this.apiPath = ''
        this.queryParams = {}
        this.apiBody = {}
        this.apiHeaders = {}
    }
}