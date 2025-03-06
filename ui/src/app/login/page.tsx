'use client'

import handleAuthResponse from "@/utils/auth/handleAuthResponse"
import { useEffect } from "react"

export default function Login() {
    useEffect(() => {
        handleAuthResponse()
    }, [])
}
