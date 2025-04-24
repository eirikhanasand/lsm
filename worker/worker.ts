import { PlatformContext, BeforeDownloadRequest, DownloadStatus, DownloadMetadata } from 'jfrog-workers'
import { BeforeDownload } from './interfaces.js';
// LAST IMPORT MUST HAVE SEMICOLON, OTHERWISE JFROG ARTIFACTORY PARSING FAILS

const OSV_URL = 'http://129.241.150.86:8080/api'

export default async function runWorker(context: PlatformContext, data: BeforeDownloadRequest): Promise<BeforeDownload> {
    const metadata = data.metadata
    try {
        const { status, data } = await fetchOSV(context, metadata)
        if (status !== 200) {
            throw new Error(JSON.stringify(data))
        }
        console.log(`Status: ${status}, Data: ${JSON.stringify(data)}`)
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

async function fetchOSV(context: PlatformContext, metadata: DownloadMetadata): Promise<{status: number, data: GoogleStatus}> {
    try {
        const response: { status: number, data: GoogleStatus} = await context
            .clients.axios.post(`${OSV_URL}/worker`, metadata)
        return response
    } catch (error) {
        throw new Error(error)
    }
}

function log(...logs: any[]): void {
    for (const log of logs) {
        console.log(log)
    }
}
