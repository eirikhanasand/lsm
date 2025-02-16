import { FastifyReply, FastifyRequest } from "fastify"
import {runInTransaction } from "../db.js"
import run from "../db.js"


export default async function whitelistDeleteHandler(
  req: FastifyRequest<{ Params: { name: string; version?: string } }>,
  res: FastifyReply
) {
  const { name, version } = req.params
  if (!name) {
    return res.status(400).send({ error: "Missing name parameter." })
  }

  try {
    await runInTransaction(async (client) => {
      if (version) {
        const versionDeleteResult = await client.query(
          "DELETE FROM whitelist_versions WHERE name = $1 AND version = $2 RETURNING *;",
          [name, version]
        )

        if (versionDeleteResult.rowCount === 0) {
          throw new Error(`No entry found for name='${name}' and version='${version}'`)
        }

        const remaining = await Promise.all([
          run("SELECT 1 FROM whitelist_versions WHERE name = $1 LIMIT 1;", [name]),
          run("SELECT 1 FROM whitelist_ecosystems WHERE name = $1 LIMIT 1;", [name]),
          run("SELECT 1 FROM whitelist_repositories WHERE name = $1 LIMIT 1;", [name]),
        ])
        
        const hasAnyReferences = remaining.some((r) => (r.rowCount ?? 0) > 0)
        if (!hasAnyReferences) {
          await run("DELETE FROM whitelist WHERE name = $1;", [name])
        }
        return
      } else {
        await client.query("DELETE FROM whitelist_versions WHERE name = $1;", [name])
        await client.query("DELETE FROM whitelist_ecosystems WHERE name = $1;", [name])
        await client.query("DELETE FROM whitelist_repositories WHERE name = $1;", [name])

        const mainDeleteResult = await client.query(
          "DELETE FROM whitelist WHERE name = $1 RETURNING *;",
          [name]
        )
        if (mainDeleteResult.rowCount === 0) {
          throw new Error(`No whitelist entry found for name='${name}'.`)
        }
        return
      }
    })
    if (version) {
      return res.send({
        message: `Whitelist entry '${name}' with version '${version}' deleted successfully.`,
      })
    } else {
      return res.send({
        message: `All whitelist entries for '${name}' deleted successfully.`,
      })
    }
  } catch (error: any) {
    if (error.message.includes("No entry found for name")) {
      return res.status(404).send({ error: error.message })
    }

    console.error("Database error:", error)
    return res.status(500).send({ error: "Internal Server Error" })
  }
}
