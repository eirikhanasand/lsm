import { FastifyReply, FastifyRequest } from 'fastify'
import config from '../constants.js'

const { DISABLE_AUTH, SELF_URL } = config

type Valid = {
    valid: boolean
    error?: string
}

export default async function tokenWrapper(req: FastifyRequest, res: FastifyReply): Promise<Valid> {
    if (DISABLE_AUTH === 'true') {
        return { valid: true }
    }

    const authHeader = req.headers['authorization']

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
            valid: false,
            error: 'Missing or invalid Authorization header'
        }
    }

    const token = authHeader.split(' ')[1]

    try {
        const response = await fetch(SELF_URL, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (!response.ok) {
            return {
                valid: false,
                error: 'Unauthorized'
            }
        }

        return { valid: true }
    } catch (err) {
        res.log.error(err)
        return res.status(500).send({
            valid: false,
            error: 'Internal server error'
        })
    }
}
