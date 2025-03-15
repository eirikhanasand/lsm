import run from "../db.js"
import { FetchListProps } from "../interfaces.js"
import { loadSQL } from "./loadSQL.js"

export default async function fetchBlacklist({ name, version, ecosystem, res }: FetchListProps) {
    console.log(`Fetching blacklist entry: name=${name}, version=${version}, ecosystem=${ecosystem}`)

    const query = await loadSQL("fetch_blacklist.sql")
    const result = await run(query, [name, version, ecosystem])

    if (result.rows.length === 0) {
        return res 
            ? res.status(404).send({ error: "Blacklist entry not found." }) 
            : []
    }

    return res 
        ? res.send(result.rows)
        : result.rows
}
