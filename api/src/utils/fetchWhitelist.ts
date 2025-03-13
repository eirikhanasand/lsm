import run from "../db.js"
import { FetchListProps } from "../interfaces.js"

export default async function fetchWhiteList({name, version, ecosystem, res}: FetchListProps) {
    console.log(`Fetching whitelist entry: name=${name}, version=${version}, ecosystem=${ecosystem}`)

    const result = await run(
        `SELECT w.name, wv.version, we.ecosystem, wc.comment, wr.repository
         FROM whitelist w
         LEFT JOIN whitelist_versions wv ON w.name = wv.name
         LEFT JOIN whitelist_ecosystems we ON w.name = we.name
         LEFT JOIN whitelist_comments wc ON w.name = wc.name
         LEFT JOIN whitelist_repositories wr ON w.name = wr.name
         LEFT JOIN whitelist_references wre on w.name = wre.name
         WHERE w.name = $1 AND wv.version = $2 AND we.ecosystem = $3;
        `, [name, version, ecosystem]
    )

    if (result.rows.length === 0) {
        return res 
            ? res.status(404).send({ error: "Whitelist entry not found." })
            : []
    }

    return res 
        ? res.send(result.rows)
        : result.rows
}
