import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import ThemeSwitch from '@/components/theme/themeSwitch'
import { cookies } from 'next/headers'
import MenuProfile from '@/components/global/menuProfile'
import config from '@parent/constants'

export const metadata: Metadata = {
    title: 'Library Safety Manager',
    description: 'A plugin to manage library packages'
}

const { IMAGE_URL } = config

/**
 * Main layout component. Every page displayed is rendered after this one 
 * through the children object.
 * 
 * @param children Other components to display (other pages) 
 * 
 * @returns React component
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const Cookies = await cookies()
    const theme = Cookies.get('theme')?.value || 'dark'
    const token = Cookies.get('token')?.value

    return (
        <html lang='en' className={theme}>
            <body className='grid w-[100vw] h-[100vh] noscroll'>
                <header className='h-[6.5vh] max-h-[6.5vh] text-white grid grid-cols-3 bg-dark'>
                    <div />
                    <Link href='/dashboard' className='text-md grid place-items-center text-white cursor-pointer'>
                        Library Safety Manager
                    </Link>
                    <nav className='flex justify-end pr-2'>
                        <ThemeSwitch />
                        <MenuProfile token={token} url={IMAGE_URL} />
                    </nav>
                </header>
                <main className='h-[93.5vh] max-h-[93.5vh] overflow-auto w-full'>
                    {children}
                </main>
            </body>
        </html>
    )
}
