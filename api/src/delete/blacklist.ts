import { FastifyReply, FastifyRequest } from "fastify"
import run from "../db.js"

type BlacklistParams = {
  name: string
  version?: string
}

export default async function blacklistDeleteHandler(req: FastifyRequest<{ Params: BlacklistParams }>, res: FastifyReply
) {
  const { name, version } = req.params
  if (!name) {
    return res.status(400).send({ error: "Missing name parameter." })
  }
  try {
    await run("BEGIN;", [])

    if (version) {
      const versionDeleteResult = await run(
        "DELETE FROM blacklist_versions WHERE name = $1 AND version = $2 RETURNING *;",
        [name, version]
      )
      if (versionDeleteResult.rowCount === 0) {
        await run("ROLLBACK;", [])
        return res.status(404).send({
          error: `No blacklist entry found for name='${name}' with version='${version}'.`,
        })
      }
      const remaining = await Promise.all([
        run("SELECT 1 FROM blacklist_versions WHERE name = $1 LIMIT 1;", [name]),
        run("SELECT 1 FROM blacklist_ecosystems WHERE name = $1 LIMIT 1;", [name]),
        run("SELECT 1 FROM blacklist_repositories WHERE name = $1 LIMIT 1;", [name]),
      ])
      const hasAnyReferences = remaining.some((r) => (r.rowCount ?? 0) > 0)
      if (!hasAnyReferences) {
        await run("DELETE FROM blacklist WHERE name = $1;", [name])
      }
      await run("COMMIT;", [])

      return res.send({
        message: `Blacklist entry '${name}' with version '${version}' deleted successfully.`,
      })
    } else {
      await run("DELETE FROM blacklist_versions WHERE name = $1;", [name])
      await run("DELETE FROM blacklist_ecosystems WHERE name = $1;", [name])
      await run("DELETE FROM blacklist_repositories WHERE name = $1;", [name])
      const mainDeleteResult = await run(
        "DELETE FROM blacklist WHERE name = $1 RETURNING *;",
        [name]
      )
      if (mainDeleteResult.rowCount === 0) {
        await run("ROLLBACK;", [])
        return res.status(404).send({
          error: `No blacklist entry found for name='${name}'.`,
        })
      }
      await run("COMMIT;", [])
      return res.send({
        message: `All blacklist entries for '${name}' deleted successfully.`,
      })
    }
  } catch (error) {
    await run("ROLLBACK;", [])
    console.error("Database error:", error)
    return res.status(500).send({ error: "Internal Server Error" })
  }
}
