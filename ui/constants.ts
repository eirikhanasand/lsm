import dotenv from 'dotenv'

dotenv.config({path: '../.env'})

const { JFROG_ID: ENV_JFROG_ID, JFROG_TOKEN: ENV_JFROG_TOKEN } = process.env
if (!ENV_JFROG_ID || !ENV_JFROG_TOKEN) {
    throw new Error("Missing JFROG_ID or JFROG_TOKEN env variables.")
}

export const JFROG_ID = ENV_JFROG_ID
export const JFROG_TOKEN = ENV_JFROG_TOKEN
