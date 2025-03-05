'use client'

import { useEffect } from "react"

// Sets user in localStorage based on URL params
export default function Login() {
    useEffect(() => {
        const url = window.location.href
        console.log("the url is", url)
        const query = new URLSearchParams(new URL(url).search)
        const encodedUserinfo = query.get("token") as string
        const user: User = JSON.parse(atob(encodedUserinfo))
        localStorage.setItem("id", user.id)
        localStorage.setItem("username", user.username)
        localStorage.setItem("avatar", user.avatar)
        localStorage.setItem("mfa_enabled", String(user.mfa_enabled))
        localStorage.setItem("locale", user.locale)
        localStorage.setItem("email", user.email)
        localStorage.setItem("verified", String(user.verified))

        // Redirects back to where the user was
        const path = localStorage.getItem('redirect') || '/dashboard'
        localStorage.removeItem('redirect')
        window.location.href = path
    }, [])
}
