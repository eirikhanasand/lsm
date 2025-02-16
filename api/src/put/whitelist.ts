import { FastifyReply, FastifyRequest } from "fastify"
import { runInTransaction } from "../db.js"

type WhitelistUpdateBody = {
  name: string
  oldVersion: string
  newVersion: string
  ecosystem: string
}

export default async function whitelistPutHandler(
  req: FastifyRequest<{ Params: WhitelistUpdateBody }>,
  res: FastifyReply
) {
  const { ecosystem, name, oldVersion, newVersion } = req.params

  if (!ecosystem || !name || !oldVersion || !newVersion) {
    return res
      .status(400)
      .send({ error: "Missing name, oldVersion, newVersion, or ecosystem." })
  }

  try {
    console.log(
      `Replacing whitelist version: name=${name}, oldVersion=${oldVersion}, newVersion=${newVersion}, ecosystem=${ecosystem}`
    )

    await runInTransaction(async (client) => {
      const checkExists = await client.query(
        "SELECT name FROM white WHERE name = $1;",
        [name]
      )
      if (checkExists.rowCount === 0) {
        throw new Error("White entry not found.")
      }

      const updateResult = await client.query(
        `
          UPDATE whitelist_versions
          SET version = $3
          WHERE name = $1
            AND version = $2;
        `,
        [name, oldVersion, newVersion]
      )

      if (updateResult.rowCount === 0) {
        await client.query(
          `
            INSERT INTO whitelist_versions (name, version)
            VALUES ($1, $2);
          `,
          [name, newVersion]
        )
      }

      await client.query(
        `
          INSERT INTO whitelist_ecosystems (name, ecosystem)
          VALUES ($1, $2)
          ON CONFLICT (name, ecosystem)
             DO UPDATE SET ecosystem = EXCLUDED.ecosystem;
        `,
        [name, ecosystem]
      )
    })

    return res.send({ message: "Whitelist entry updated successfully." })
  } catch (error: any) {
    console.error("Database error:", error)
    if (error.message.includes("not found")) {
      return res.status(404).send({ error: error.message })
    }
    return res.status(500).send({ error: "Internal Server Error" })
  }
}
