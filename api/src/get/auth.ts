import { FastifyReply, FastifyRequest } from "fastify"
import { API, CLIENT_ID, CLIENT_SECRET, FRONTEND_URL } from "../constants.js"
import run from "../db.js"

export function loginHandler(_: FastifyRequest, res: FastifyReply) {
    const redirectUri = encodeURIComponent(`${API}/oauth2/callback`)
    const scope = encodeURIComponent("identify email guilds openid")
    const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}`
    res.redirect(discordAuthUrl)
}

export function logoutHandler(_: FastifyRequest, res: FastifyReply) {
    res.send({"result": "user tried to logout"})
}

export async function loginCallbackHandler(req: FastifyRequest, res: FastifyReply) {
    const { code } = req.query as { code?: string }
    if (!code) {
        return res.status(400).send({ error: "Authorization code missing" })
    }

    console.log(`code '${code}'`)
    console.log("body", new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: `${API}/oauth2/callback`,
    }))

    try {
        const response = await fetch("https://discord.com/api/oauth2/token", {
            method: 'POST',
            headers: { 
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: "authorization_code",
                code,
                redirect_uri: `${API}/oauth2/callback`,
            })
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        const { access_token } = data as any
        const userResponse = await fetch("https://discord.com/api/users/@me", {
            headers: { Authorization: `Bearer ${access_token}` }
        })
        const userData = await userResponse.json()
        const { id, username, avatar, mfa_enabled, locale, email, verified } = userData as {[key: string]: string}
        const token = btoa(JSON.stringify({token: access_token, id, username, avatar, mfa_enabled, locale, email, verified}))
        await run(
            `INSERT INTO users (id, name, avatar)
             SELECT $1, $2, $3
             WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = $1);`, 
            [id, username, avatar]
        )
        res.redirect(`${FRONTEND_URL}/login?token=${token}`)
    } catch (error) {
        console.error(`Error during OAuth2 process: ${error}`)
        res.status(500).send({ error: "OAuth2 login failed" })
    }
}
