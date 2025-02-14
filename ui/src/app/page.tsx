import Link from "next/link"

export default function Home() {
    return (
        <main className="h-full grid place-items-center p-4">
            <div>
                <h1 className="text-3xl font-bold text-blue-600 text-center">Library Safety Manager</h1>
                <p className="mt-2 text-gray-700">A plugin for JFrog&apos;s Artifactory to check for vulnerabilities in packages.</p>
                
                <Link href="/dashboard" className="grid place-items-center">
                    <button className="mt-2 rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 mb-2">
                        Login
                    </button>
                    <h1 className="text-red-500">Login is currently disabled.</h1>
                </Link>
            </div>
        </main>
    )
}
