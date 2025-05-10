import { PlatformContext, BeforeDownloadRequest, DownloadStatus, DownloadMetadata } from 'jfrog-workers'
import { BeforeDownload } from './interfaces.js';
// LAST IMPORT MUST HAVE SEMICOLON, OTHERWISE JFROG ARTIFACTORY PARSING FAILS

const OSV_URL = 'http://129.241.150.86:8080/api'

/**
 * The main worker function. Should be imported to JFrog Artifactory and enabled.
 * Runs every time a package is requested, and checks for vulnerabilties against
 * the OSV API.
 * 
 * @param context JFrog Artifactory Context Object
 * @param data data provided by the JFrog Artifactory Worker
 * 
 * @returns A status detailing whether to allow or block the requested package.
 */
export default async function runWorker(context: PlatformContext, data: BeforeDownloadRequest): Promise<BeforeDownload> {
    const metadata = data.metadata
    try {
        const { status, data } = await fetchOSV(context, metadata)
        if (status !== 200) {
            throw new Error(JSON.stringify(data))
        }
        console.log(`Status: ${status}, Data: ${JSON.stringify(data)}`)
        // Sends all logs from the API in the JFrog Artifactory portal.
        log(...data.log)
        return {
            status: data.status,
            message: data.message,
            headers: {}
        }
    } catch (error) {
        return {
            status: DownloadStatus.DOWNLOAD_STOP,
            message: `DOWNLOAD STOPPED: Worker unable to fetch API.`,
            headers: {}
        }
    }
}

/**
 * Fetches the OSV API endpoint.
 * 
 * @param context JFrog Artifactory Context Object
 * @param metadata Metadata provided by the JFrog Artifactory Worker
 * 
 * @returns Promised object containing `status` and `data`.
 */
async function fetchOSV(context: PlatformContext, metadata: DownloadMetadata): Promise<{status: number, data: GoogleStatus}> {
    try {
        const response: { status: number, data: GoogleStatus} = await context
            .clients.axios.post(`${OSV_URL}/worker`, metadata)
        return response
    } catch (error) {
        throw new Error(error)
    }
}

/**
 * Logs an array of logs
 * @param logs Array of logs
 */
function log(...logs: any[]): void {
    for (const log of logs) {
        console.log(log)
    }
}
