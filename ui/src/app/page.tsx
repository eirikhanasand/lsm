import Link from "next/link"
import { API } from "@parent/constants"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function Home() {
    const Cookies = await cookies()
    const token = Cookies.get('token')?.value
    if (token) {
        redirect('/dashboard')
    }

    return (
        <main className="h-full grid place-items-center p-4">
            <div>
                <h1 className="text-2xl font-bold text-blue-600 text-center">Library Safety Manager</h1>
                <p className="mt-2 text-foreground">
                    A plugin for JFrog Artifactory to check for vulnerabilities in packages.
                </p>

                <Link href={`${API}/oauth2/login`} className="grid place-items-center">
                    <button className="mt-2 rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 mb-2">
                        Login
                    </button>
                </Link>
            </div>
        </main>
    )
}
