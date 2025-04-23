import { setCookie } from '../cookies'

export default async function handleAuthResponse() {
    const url = window.location.href
    const query = new URLSearchParams(new URL(url).search)
    const encodedUserinfo = query.get('token')
    if (!encodedUserinfo) {
        return
    }

    const user = JSON.parse(atob(encodedUserinfo))

    setCookie('token', user.token)
    setCookie('id', user.id)
    setCookie('user', user.username)
    setCookie('avatar', user.avatar)
    setCookie('mfa_enabled', user.mfa_enabled)
    setCookie('locale', user.locale)
    setCookie('email', user.email)
    setCookie('verified', user.verified)

    // Redirects the user after authentication
    // const path = localStorage.getItem('redirect') || '/dashboard'
    // localStorage.removeItem('redirect')
    const path = '/dashboard'
    window.location.href = path
}
