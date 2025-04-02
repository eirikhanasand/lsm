import run from "../../db"
import { loadSQL } from "../loadSQL"

type GetListLengthProps = {
    list: 'white' | 'black'
    name?: string
    ecosystem?: string
    version?: string
}

export default async function getListLength({
    list, 
    name, 
    ecosystem, 
    version
}: GetListLengthProps): Promise<number> {
    const query = await loadSQL(list === 'white' 
        ? "fetchWhitelistLength.sql" 
        : "fetchBlacklistLength.sql"
    )
    const result = await run(query, [
        name || null, 
        ecosystem || null, 
        version || null
    ])
    return result as unknown as number
}
