import type { NextConfig } from 'next'
import config from './constants'

const { IMAGE_URL_SHORT } = config

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
