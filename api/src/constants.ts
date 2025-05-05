import dotenv from 'dotenv'

type ENV = {
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
    NEXT_PUBLIC_SELF_URL: string
    OAUTH_BASE_URL: string
    OAUTH_AUTH_URL: string
    NEXT_PUBLIC_DISABLE_AUTH: string
    NEXT_PUBLIC_API: string
    JFROG_ID: string
    JFROG_TOKEN: string
}

dotenv.config({ path: '../.env' })

const {
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
    DEFAULT_RESULTS_PER_PAGE: ENV_DEFAULT_RESULTS_PER_PAGE,
    NEXT_PUBLIC_SELF_URL,
    OAUTH_TOKEN_URL,
    OAUTH_BASE_URL,
    NEXT_PUBLIC_DISABLE_AUTH,
    OAUTH_AUTH_URL,
    NEXT_PUBLIC_API,
    JFROG_ID,
    JFROG_TOKEN
} = process.env as ENV
if (!NEXT_PUBLIC_API 
    || !FRONTEND_URL
    || !LOCAL_OSV
    || !DB_PASSWORD
    || !JFROG_ID
    || !JFROG_TOKEN
) {
    throw new Error('Missing NEXT_PUBLIC_API, FRONTEND_URL, LOCAL_OSV or DB_PASSWORD.')
}

if (
    (!CLIENT_ID || !CLIENT_SECRET || !OAUTH_BASE_URL || !OAUTH_TOKEN_URL)
    && NEXT_PUBLIC_DISABLE_AUTH !== 'true'
) {
    throw new Error('Either OAuth URLs or NEXT_PUBLIC_DISABLE_AUTH=true must be set.')
}

const config = {
    API: NEXT_PUBLIC_API,
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
    DEFAULT_RESULTS_PER_PAGE: ENV_DEFAULT_RESULTS_PER_PAGE || 50,
    SELF_URL: NEXT_PUBLIC_SELF_URL,
    OAUTH_TOKEN_URL,
    OAUTH_BASE_URL,
    OAUTH_AUTH_URL,
    DISABLE_AUTH: NEXT_PUBLIC_DISABLE_AUTH,
    JFROG_ID,
    JFROG_TOKEN
}

export default config
