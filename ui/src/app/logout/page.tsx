'use client'

import { removeCookies } from "@/utils/cookies"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Login() {
    const router = useRouter()
    useEffect(() => {
        removeCookies('avatar', 'email', 'id', 'locale', 'mfa_enabled', 'token', 'username', 'verified')
        router.push('/')
        router.refresh()
    }, [])
}
