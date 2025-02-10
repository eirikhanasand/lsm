import Link from "next/link"

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
            <h1 className="text-3xl font-bold text-blue-600">Library Safety Manager</h1>
            <p className="mt-2 text-gray-700">A plugin for JFrog&apos;s Artifactory to check for vulnerabilities in packages.</p>
            
            <Link href="/dashboard" className="grid place-items-center">
                <button className="mt-2 rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 mb-2">
                    Login
                </button>
                <h1 className="text-red-500">Login is currently disabled.</h1>
            </Link>
        </main>
    )
}
