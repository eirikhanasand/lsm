import type { NextConfig } from "next"
import { IMAGE_URL_SHORT } from "./constants"

const nextConfig: NextConfig = {
    images: {
        remotePatterns: IMAGE_URL_SHORT ? [
            {
                protocol: 'https',
                hostname: IMAGE_URL_SHORT,
                pathname: '/avatars/**',
            },
            {
                protocol: 'https',
                hostname: IMAGE_URL_SHORT,
                pathname: '/embed/avatars/**',
            }
        ] : []
    }
}

export default nextConfig
