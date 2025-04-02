import { FastifyReply } from "fastify"
import run from "../../db.js"
import { loadSQL } from "../loadSQL.js"

type FetchListProps = {
    name: string
    version: string
    ecosystem: string
    list: 'white' | 'black'
    res?: FastifyReply
}

export default async function fetchList({ name, ecosystem, version, res, list }: FetchListProps) {
    console.log(`Fetching ${list}list entry: name=${name}, version=${version}, ecosystem=${ecosystem}`)

    const query = await loadSQL(list === 'white' ? "fetchWhitelist.sql" : "fetchBlacklist.sql")
    const result = await run(query, [name, version, ecosystem])

    if (result.rows.length === 0) {
        return res 
            ? res.status(404).send({ error: `${list}list entry not found.` })
            : []
    }

    return res 
        ? res.send(result.rows)
        : result.rows
}
