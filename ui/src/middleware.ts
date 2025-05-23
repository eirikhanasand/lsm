import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware function that intercepts all requests before they reach the rest
 * of the application. Handles authentication if the requested path requires it.
 * 
 * @param req Next Request
 * 
 * @returns To the rest of the application, or redirects the user if
 * unauthenticated.
 */
export async function middleware(req: NextRequest) {
    const tokenCookie = req.cookies.get('token')
    // Checks if the path requires authentication, or if authentication is disabled.
    if (!pathIsAllowedWhileUnauthenticated(req.nextUrl.pathname) && process.env.NEXT_PUBLIC_DISABLE_AUTH !== 'true') {
        if (!tokenCookie) {
            return NextResponse.redirect(new URL('/', req.url))
        }

        // Checks if the token is valid, and redirects the user if not.
        const token = tokenCookie.value
        const validToken = await tokenIsValid(req, token as unknown as string)
        if (!validToken && !pathIsAllowedWhileUnauthenticated(req.nextUrl.pathname)) {
            return NextResponse.redirect(new URL('/logout', req.url))
        }
    }

    // Passes the theme to prerender the content for the appropriate theme.
    const theme = req.cookies.get('theme')?.value || 'dark'
    const res = NextResponse.next()
    res.headers.set('x-theme', theme)
    return res
}

/**
 * Checks if the requested path requires authentication.
 * 
 * @param path Path requested by the user
 * 
 * @returns Boolean based on whether authentication is required.
 */
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

/**
 * Checks if the user´s token is valid.
 * 
 * @param req Next Request 
 * @param token Token provided by the user
 * 
 * @returns Boolean based on whether the token is valid. 
 */
async function tokenIsValid(req: NextRequest, token: string): Promise<boolean> {
    if (process.env.NEXT_PUBLIC_DISABLE_TOKEN_CHECK === 'true') {
        return true
    }

    if (!process.env.NEXT_PUBLIC_SELF_URL) {
        console.error(`Missing NEXT_PUBLIC_SELF_URL environment variable.`)
        return false
    }

    const tokenResponse = await fetch(process.env.NEXT_PUBLIC_SELF_URL, {
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

/**
 * Checks if additional user properties match the required value. This does not
 * have any impact on the API, but prevents the user from modifying the values
 * frontend. Even if modified they will not have any impact on the API, as 
 * they are not used there.
 * 
 * @param req Next request
 * @param userData User data
 * @returns Boolean based on whether all values match
 */
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
