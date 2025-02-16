import dotenv from 'dotenv'

dotenv.config({path: '../.env'})

const { 
    JFROG_ID: ENV_JFROG_ID, 
    JFROG_TOKEN: ENV_JFROG_TOKEN,
    API: ENV_API
} = process.env

// Document check to bypass client side check
// if (!ENV_JFROG_ID || !ENV_JFROG_TOKEN || !ENV_API) {
//     throw new Error("Missing JFROG_ID, JFROG_TOKEN or API env variables.")
// }

export const JFROG_ID = ENV_JFROG_ID
export const JFROG_TOKEN = ENV_JFROG_TOKEN
export const API = ENV_API || 'http://localhost:8080/api'
