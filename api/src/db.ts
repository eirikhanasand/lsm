// import dotenv from 'dotenv'
import pg from 'pg'
const { Pool } = pg

// dotenv.config({ path: '../../.env' })

// const { DB_PASSWORD } = process.env
// if (!DB_PASSWORD) {
//     throw new Error("Missing DB_PASSWORD env variable.")    
// }

const pool = new Pool({
    user: "osvuser",
    host: "lsm_database",
    database: "osvdb",
    password: 'osvpassword',
    // password: DB_PASSWORD,
    port: 5432,
    max: 20,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 3000
})

export default async function run(query: string, params: string[]) {
    const client = await pool.connect()
    try {
        return await client.query(query, params)
    } catch (error) {
        client.release()
        throw error
    } finally {
        client.release()
    }
}
