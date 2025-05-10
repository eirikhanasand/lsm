import { BeforeDownloadResponse } from 'jfrog-workers'

// Interface to extend the BeforeDownloadResponse with headers.
export interface BeforeDownload extends BeforeDownloadResponse {
    headers: Record<string, string>
}
