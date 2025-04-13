import dotenv from 'dotenv'

type ENV = { 
    API: string
    CLIENT_ID: string
    CLIENT_SECRET: string
    FRONTEND_URL: string
    DEFAULT_MAL_SEVERITY: string
    DEFAULT_CVE_SEVERITY: string
    DEFAULT_SEVERITY: string
    LOCAL_OSV: string
    OSV_URL: string
    DB: string
    DB_PASSWORD: string
    DB_USER: string
    DB_HOST: string
    DB_PORT: string
    DB_MAX_CONN: string
    DB_IDLE_TIMEOUT_MS: string
    DB_TIMEOUT_MS: string
    DEFAULT_RESULTS_PER_PAGE: string
    OAUTH_TOKEN_URL: string
    SELF_URL: string
}

dotenv.config({path: '../.env'})

const { 
    API, 
    CLIENT_ID, 
    CLIENT_SECRET, 
    FRONTEND_URL, 
    DEFAULT_MAL_SEVERITY,
    DEFAULT_CVE_SEVERITY,
    DEFAULT_SEVERITY,
    LOCAL_OSV, 
    OSV_URL,
    DB,
    DB_USER,
    DB_HOST,
    DB_PASSWORD,
    DB_PORT,
    DB_MAX_CONN,
    DB_IDLE_TIMEOUT_MS,
    DB_TIMEOUT_MS,
    DEFAULT_RESULTS_PER_PAGE,
    SELF_URL,
    OAUTH_TOKEN_URL
} = process.env as ENV
if (!API 
    || !CLIENT_ID 
    || !CLIENT_SECRET 
    || !FRONTEND_URL 
    || !LOCAL_OSV 
    || !DB_PASSWORD
    || !SELF_URL
    || !OAUTH_TOKEN_URL
) {
    throw new Error("Missing one or more environment variables.")
}

const config = {
    API, 
    CLIENT_ID, 
    CLIENT_SECRET, 
    FRONTEND_URL, 
    DEFAULT_MAL_SEVERITY,
    DEFAULT_CVE_SEVERITY,
    DEFAULT_SEVERITY,
    LOCAL_OSV, 
    OSV_URL,
    DB,
    DB_HOST,
    DB_USER,
    DB_PASSWORD, 
    DB_PORT,
    DB_MAX_CONN,
    DB_IDLE_TIMEOUT_MS,
    DB_TIMEOUT_MS,
    DEFAULT_RESULTS_PER_PAGE,
    SELF_URL,
    OAUTH_TOKEN_URL
}

export default config
