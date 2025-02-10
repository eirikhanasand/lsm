import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
    title: "Library Safety Manager",
    description: "A plugin to manage library packages",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="bg-gray-50">
                <header className="p-4 bg-blue-500 text-white text-center">
                    <h1 className="text-lg font-semibold">Library Safety Manager</h1>
                </header>
                <main className="container mx-auto p-4">{children}</main>
            </body>
        </html>
    )
}
