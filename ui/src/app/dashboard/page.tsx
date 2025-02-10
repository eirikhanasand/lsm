import Link from "next/link"

export default function Dashboard() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
            <h1 className="text-3xl font-bold text-blue-600">Dashboard</h1>
            <p className="mt-2 text-gray-700">Manage your library safety settings and see/edit whitelisted and blacklisted packages.</p>

            <div className="mt-6 flex flex-col space-y-4">
                <Link href="/dashboard/repositories">
                    <button className="w-60 rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600">
                        Repositories
                    </button>
                </Link>
              
                <Link href="/dashboard/whitelisted">
                    <button className="w-60 rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600">
                        Whitelisted Packages
                    </button>
                </Link>
                
                <Link href="/dashboard/blacklisted">
                    <button className="w-60 rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600">
                        Blacklisted Packages
                    </button>
                </Link>

                <Link href="/dashboard/settings">
                    <button className="w-60 rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600">
                        Settings
                    </button>
                </Link>
            </div>
        </main>
    )
}
