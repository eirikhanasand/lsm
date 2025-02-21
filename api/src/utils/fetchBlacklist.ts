import run from "../db.js"
import { FetchListProps } from "../interfaces.js"

export default async function fetchBlackList({name, version, ecosystem, res}: FetchListProps) {
    console.log(`Fetching blacklist entry: name=${name}, version=${version}, ecosystem=${ecosystem}`)

    const result = await run(
        `SELECT b.name, bv.version, be.ecosystem, bc.comment, br.repository
         FROM blacklist b
         LEFT JOIN blacklist_versions bv ON b.name = bv.name
         LEFT JOIN blacklist_ecosystems be ON b.name = be.name
         LEFT JOIN blacklist_comments bc ON b.name = bc.name
         LEFT JOIN blacklist_repositories br ON b.name = br.name
         WHERE b.name = $1 AND bv.version = $2 AND be.ecosystem = $3;
        `, [name, version, ecosystem]
    )

    if (result.rows.length === 0) {
        return res 
            ? res.status(404).send({ error: "Blacklist entry not found." })
            : []
    }

    return res 
        ? res.send(result.rows)
        : result.rows
}
