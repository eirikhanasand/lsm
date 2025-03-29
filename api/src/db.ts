import pg from 'pg'
import { 
    DB, 
    DB_USER, 
    DB_HOST, 
    DB_PASSWORD, 
    DB_PORT, 
    DB_MAX_CONN, 
    DB_IDLE_TIMEOUT_MS, 
    DB_TIMEOUT_MS
} from './constants.js'
const { Pool } = pg

const pool = new Pool({
    user: DB_USER || "osvuser",
    host: DB_HOST || "lsm_database",
    database: DB || "osvdb",
    password: DB_PASSWORD,
    port: Number(DB_PORT) || 5432,
    max: Number(DB_MAX_CONN) || 20,
    idleTimeoutMillis: Number(DB_IDLE_TIMEOUT_MS) || 5000,
    connectionTimeoutMillis: Number(DB_TIMEOUT_MS) || 3000
})

export default async function run(query: string, params: string[]) {
    const client = await pool.connect()
    try {
        return await client.query(query, params)
    } catch (error) {
        throw error
    } finally {
        client.release()
    }
}

export async function runInTransaction<T>(
    callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
    const client = await pool.connect()
    try {
        await client.query("BEGIN")
        const result = await callback(client)
        await client.query("COMMIT")
        return result
    } catch (error) {
        await client.query("ROLLBACK")
        throw error
    } finally {
        client.release()
    }
}
