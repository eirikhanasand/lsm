import dotenv from 'dotenv'

type ENV = { 
    API: string
    CLIENT_ID: string
    CLIENT_SECRET: string
    FRONTEND_URL: string
    DEFAULT_MAL_SEVERITY: string
    DB_PASSWORD: string
    LOCAL_OSV: string
    OSV_URL: string
}

dotenv.config({path: '../.env'})

const REDHAT_API = "https://access.redhat.com/hydra/rest/securitydata"
const { 
    API, 
    CLIENT_ID, 
    CLIENT_SECRET, 
    FRONTEND_URL, 
    DEFAULT_MAL_SEVERITY, 
    DB_PASSWORD, 
    LOCAL_OSV, 
    OSV_URL
} = process.env as ENV
if (!API 
    || !CLIENT_ID 
    || !CLIENT_SECRET 
    || !FRONTEND_URL 
    || !DB_PASSWORD 
    || !LOCAL_OSV 
    || !OSV_URL
) {
    throw new Error("Missing API, CLIENT_ID, CLIENT_SECRET, DEFAULT_MAL_SEVERITY, DB_PASSWORD, LOCAL_OSV, OSV_URL and / or FRONTEND_URL env variable.")
}

export { 
    API, 
    CLIENT_ID, 
    CLIENT_SECRET, 
    FRONTEND_URL, 
    REDHAT_API, 
    DEFAULT_MAL_SEVERITY, 
    DB_PASSWORD, 
    LOCAL_OSV, 
    OSV_URL
}
