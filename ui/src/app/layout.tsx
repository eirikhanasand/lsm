import type { Metadata } from "next"
import "./globals.css"
import Link from "next/link"
import ThemeSwitch from "@/components/themeSwitch"
import { cookies } from "next/headers"
import Image from "next/image"
export const metadata: Metadata = {
    title: "Library Safety Manager",
    description: "A plugin to manage library packages"
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const Cookies = await cookies()
    const theme = Cookies.get('theme')?.value || 'dark'
    const token = Cookies.get('token')?.value

    return (
        <html lang="en" className={theme}>
            <body className='grid w-[100vw] h-[100vh] noscroll'>
                <header className="h-[6.5vh] max-h-[6.5vh] text-white grid grid-cols-3 bg-dark">
                    <div />
                    <Link href="/dashboard" className="text-md grid place-items-center text-white">
                        Library Safety Manager
                    </Link>
                    <nav className="flex justify-end">
                        {token && <Link 
                            href="/logout"
                            className='relative w-[3.5vh] h-[3.5vh] self-center' 
                        >
                            <Image src="/logout.svg" alt="logo" fill={true} />
                        </Link>}
                        <ThemeSwitch />
                    </nav>
                </header>
                <main className='h-[93.5vh] max-h-[93.5vh] overflow-auto w-full'>
                    {children}
                </main>
            </body>
        </html>
    )
}
