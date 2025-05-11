'use client'

import handleAuthResponse from '@/utils/auth/handleAuthResponse'
import { useEffect } from 'react'

/**
 * Login handler. Executes when the user lands on the `/login` path. Uses a
 * useEffect which immediately triggers on render to handle the login. This 
 * technique avoids a flash by temporarily rendering a page while the 
 * information is processed.
 */
export default function Login() {
    useEffect(() => {
        handleAuthResponse()
    }, [])
}
