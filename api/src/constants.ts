import dotenv from 'dotenv'

type ENV = { 
    API: string
    CLIENT_ID: string
    CLIENT_SECRET: string
    FRONTEND_URL: string
}

dotenv.config()

const { API, CLIENT_ID, CLIENT_SECRET, FRONTEND_URL } = process.env as ENV
if (!API || !CLIENT_ID || !CLIENT_SECRET || !FRONTEND_URL) {
    throw new Error("Missing API, CLIENT_ID, CLIENT_SECRET and / or FRONTEND_URL env variable.")
}

export { API, CLIENT_ID, CLIENT_SECRET, FRONTEND_URL }
