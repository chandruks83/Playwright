export class APILogger {

    private recentLogs: any[] = []

    /**
     * This method collects the details of the request sent
     * @param method - get/post/put 
     * @param url - complete url of the request
     * @param headers - header details
     * @param body - Optional as it is specific to only post and put
     */
    logRequest(method: string, url: string, headers: Record<string,string>, body?: any){
        const logEntry = {method, url, headers, body}  //Object that consilidates all the details
        this.recentLogs.push({type: 'Request details', data: logEntry})//Tagged objects to specify the request type
    }

    logResponse(statusCode:number, body?:any){
        const logEntry = {statusCode, body}
        this.recentLogs.push({type: "Response details", data:logEntry})
    }

    /**
     * This method collects all the request/response details in a formatted way
     * Calls a defined callback function on each element of an array, 
     * and returns an array that contains the results.
     * log.data contains data in json format, this is converted to string using JSON.stringify method
     */
    getRecentlogs(){
        const logs = this.recentLogs.map(log=>{
            return `===${log.type}===\n${JSON.stringify(log.data, null, 4)}`
        }).join('\n\n')
        return logs
    }
}