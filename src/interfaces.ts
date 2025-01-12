import { BeforeDownloadResponse } from "jfrog-workers"

export interface BeforeDownload extends BeforeDownloadResponse {
    headers: Record<string, string>
}
