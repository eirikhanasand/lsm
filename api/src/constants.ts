import dotenv from 'dotenv'

type ENV = { 
    API: string
    CLIENT_ID: string
    CLIENT_SECRET: string
    FRONTEND_URL: string
    DEFAULT_MAL_SEVERITY: string
}

dotenv.config({path: '../.env'})

const REDHAT_API = "https://access.redhat.com/hydra/rest/securitydata"
const { API, CLIENT_ID, CLIENT_SECRET, FRONTEND_URL, DEFAULT_MAL_SEVERITY } = process.env as ENV
if (!API || !CLIENT_ID || !CLIENT_SECRET || !FRONTEND_URL) {
    throw new Error("Missing API, CLIENT_ID, CLIENT_SECRET, DEFAULT_MAL_SEVERITY and / or FRONTEND_URL env variable.")
}

export { API, CLIENT_ID, CLIENT_SECRET, FRONTEND_URL, REDHAT_API, DEFAULT_MAL_SEVERITY }
