/**
 * Fetches a cookie from the browser
 * @param name Name of the cookie in question
 * @returns The cookies value if one exists, otherwise `null`
 */
export function getCookie(name: string): string | null {
    const matches = document.cookie.match(new RegExp(
        `(?:^|; )${name.replace(/([.$?*|{}()\[\]\/\\+^])/g, '\\$1')}=([^;]*)`
    ))
    return matches ? decodeURIComponent(matches[1]) : null
}

/**
 * Sets a cookie in the browser
 *
 * @param name Name of the cookie to set
 * @param value The cookie value
 * @param days How long the cookie should be valid
 */
export function setCookie(name: string, value: string, days?: number) {
    let expires = ''

    if (!value) {
        return
    }

    if (days) {
        const date = new Date()
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
        expires = `expires=${date.toUTCString()};`
    }

    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires} path=/; SameSite=Lax`
}

/**
 * Removes one or more cookies from the browser
 * @param cookies Array of cookies to remove
 */
export function removeCookies(...cookies: string[]) {
    for (const cookie of cookies) {
        removeCookie(cookie)
    }
}

/**
 * Removes a cookie from the browser
 * @param name Name of the cookie to remove
 */
export function removeCookie(name: string) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`
}
