import run from "../db"
import { FetchListProps } from "../interfaces"

export default async function fetchBlackList({name, version, ecosystem, res}: FetchListProps) {
    console.log(`Fetching blacklist entry: name=${name}, version=${version}, ecosystem=${ecosystem}`)

    const result = await run(
        `SELECT w.name, wv.version, we.ecosystem 
         FROM blacklist w
         LEFT JOIN blacklist_versions wv ON w.name = wv.name
         LEFT JOIN blacklist_ecosystems we ON w.name = we.name
         LEFT JOIN blacklist_comments wc ON w.name = wc.name
         LEFT JOIN blacklist_repositories wr ON w.name = wr.name
         WHERE w.name = $1 AND wv.version = $2 AND we.ecosystem = $3;
        `, [name, version, ecosystem]
    )

    if (result.rows.length === 0) {
        return res 
            ? res.status(404).send({ error: "Blacklist entry not found." })
            : []
    }

    return res 
        ? res.send(result.rows[0])
        : result.rows[0]
}
