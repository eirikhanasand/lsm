import { NextRequest, NextResponse } from 'next/server'
import { DISABLE_TOKEN_CHECK, SELF_URL } from '@parent/constants'
import { DISABLE_AUTH } from '@parent/constants'

export async function middleware(req: NextRequest) {
    const tokenCookie = req.cookies.get('token')
    if (!pathIsAllowedWhileUnauthenticated(req.nextUrl.pathname) && DISABLE_AUTH) {
        if (!tokenCookie) {
            return NextResponse.redirect(new URL('/', req.url))
        }
        const token = tokenCookie.value
        const validToken = await tokenIsValid(req, token as unknown as string)
        if (!validToken && !pathIsAllowedWhileUnauthenticated(req.nextUrl.pathname)) {
            return NextResponse.redirect(new URL('/logout', req.url))
        }
    }
    const theme = req.cookies.get('theme')?.value || 'dark'
    const res = NextResponse.next()
    res.headers.set('x-theme', theme)
    return res
}

function pathIsAllowedWhileUnauthenticated(path: string) {
    if (path === '/' || path === '/favicon.ico') {
        return true
    }

    if (path.startsWith('/_next/static/chunks/') || path.startsWith('/_next/static/css/')) {
        return true
    }

    if (path.startsWith('/login') || path.startsWith('/logout')) {
        return true
    }

    return false
}

async function tokenIsValid(req: NextRequest, token: string): Promise<boolean> {
    if (DISABLE_TOKEN_CHECK === 'true') {
        return true
    }

    const tokenResponse = await fetch(SELF_URL, {
        headers: { Authorization: `Bearer ${token}` }
    })

    if (!tokenResponse.ok) {
        NextResponse.redirect(new URL('/logout', req.url))
        return false
    }

    const userData = await tokenResponse.json()
    const match = valuesMatch(req, { token, ...userData })
    if (!match) {
        return false
    }

    return true
}

function valuesMatch(req: NextRequest, userData: User): boolean {
    const avatar = req.cookies.get('avatar')?.value
    const email = req.cookies.get('email')?.value
    const id = req.cookies.get('id')?.value
    const locale = req.cookies.get('locale')?.value
    const mfa_enabled = req.cookies.get('mfa_enabled')?.value
    const token = req.cookies.get('token')?.value
    const username = req.cookies.get('user')?.value
    const verified = req.cookies.get('verified')?.value

    if (avatar !== userData.avatar) return false
    if (email !== userData.email) return false
    if (id !== userData.id) return false
    if (locale !== userData.locale) return false
    if (Boolean(mfa_enabled) !== userData.mfa_enabled) return false
    if (token !== userData.token) return false
    if (username !== userData.username) return false
    if (Boolean(verified) !== userData.verified) return false
    return true
}
