import type { Metadata } from "next"
import "./globals.css"
import Link from "next/link"
import ThemeSwitch from "@/components/themeSwitch"
import { cookies } from "next/headers"

export const metadata: Metadata = {
    title: "Library Safety Manager",
    description: "A plugin to manage library packages"
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const theme = (await cookies()).get('theme')?.value || 'dark'

    return (
        <html lang="en" className={theme}>
            <body className='grid w-[100vw] h-[100vh] noscroll'>
                <header className="h-[6.5vh] max-h-[6.5vh] text-white grid grid-cols-3 bg-dark">
                    <div />
                    <Link href="/dashboard" className="text-md grid place-items-center text-white">
                        Library Safety Manager
                    </Link>
                    <ThemeSwitch />
                </header>
                <main className='h-[93.5vh] max-h-[93.5vh] overflow-auto w-full'>
                    {children}
                </main>
            </body>
        </html>
    )
}
