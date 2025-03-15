import run from "../db.js"
import { FetchListProps } from "../interfaces.js"
import { loadSQL } from "./loadSQL.js"

export default async function fetchWhiteList({ name, version, ecosystem, res }: FetchListProps) {
    console.log(`Fetching whitelist entry: name=${name}, version=${version}, ecosystem=${ecosystem}`)

    const query = await loadSQL("fetch_whitelist.sql")
    const result = await run(query, [name, version, ecosystem])

    if (result.rows.length === 0) {
        return res 
            ? res.status(404).send({ error: "Whitelist entry not found." })
            : []
    }

    return res 
        ? res.send(result.rows)
        : result.rows
}
