import { FastifyReply, FastifyRequest } from "fastify"
import run from "../db.js"

type UserResponse = {
    id: number
    name: string
    image: string
}

export default async function userHandler(req: FastifyRequest, res: FastifyReply) {
    const { id } = req.params as { id: string }
    if (!id) {
        return res.status(400).send({ error: "Missing id." })
    }

    try {
        console.log(`Fetching user ${id}`)
        const userResult = await run(`SELECT id, name, image FROM users WHERE id = $1`, [id])
        if (!userResult.rows.length) {
            return res.status(404).send({ error: `There is no user with id ${id}` })
        }

        const user: UserResponse = userResult.rows[0]

        return res.send(user)
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
