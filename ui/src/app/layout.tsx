import type { Metadata } from "next"
import "./globals.css"
import Link from "next/link"
import ThemeSwitch from "@/components/themeSwitch"

export const metadata: Metadata = {
    title: "Library Safety Manager",
    description: "A plugin to manage library packages",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className='h-[100vh] w-[100vw] bg-red-500'>
            <body className='grid grid-rows-12 w-full h-full noscroll'>
                <header className="row-span-1 bg-blue-500 text-white grid grid-cols-3">
                    <div />
                    <Link href="/dashboard" className="text-md grid place-items-center">
                        Library Safety Manager
                    </Link>
                    <ThemeSwitch />
                </header>
                <main className='row-span-11 w-full'>
                    {children}
                </main>
            </body>
        </html>
    )
}
