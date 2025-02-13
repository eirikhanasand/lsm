import type { Metadata } from "next"
import "./globals.css"
import Link from "next/link"
import DarkModeToggle from "@/components/DarkModeToggle"

export const metadata: Metadata = {
    title: "Library Safety Manager",
    description: "A plugin to manage library packages",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <header className="p-4 bg-blue-500 text-white text-center relative">
                    <Link href="/dashboard" className="text-lg font-semibold">
                        Library Safety Manager
                    </Link>
                    <DarkModeToggle />
                </header>
                <main className="container mx-auto p-4">{children}</main>
            </body>
        </html>
    )
}
