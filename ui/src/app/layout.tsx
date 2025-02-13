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
        <html lang="en">
            <body>
                <header className="p-2 bg-blue-500 text-white text-center relative grid grid-cols-3">
                    <div />
                    <Link href="/dashboard" className="text-md font-semibold">
                        Library Safety Manager
                    </Link>
                    <ThemeSwitch />
                </header>
                <main className="container mx-auto p-4">{children}</main>
            </body>
        </html>
    )
}
