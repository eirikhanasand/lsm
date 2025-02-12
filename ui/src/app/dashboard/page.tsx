import Link from "next/link"

type SectionProps = {
    text: string
    href: string
}

export default function Dashboard() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
            <h1 className="text-3xl font-bold text-blue-600">Dashboard</h1>
            <p className="mt-2 text-gray-700">Manage your library safety settings and see/edit whitelisted and blacklisted packages.</p>
            <div className="mt-6 flex flex-col space-y-4">
                <Section text="Repositories" href="/dashboard/repositories" />
                <Section text="Whitelisted Packages" href="/dashboard/whitelisted" />  
                <Section text="Blacklisted Packages" href="/dashboard/blacklisted" />
                <Section text="Statistics" href="/dashboard/statistics" />
                <Section text="Settings" href="/dashboard/settings" />
            </div>
        </main>
    )
}

function Section({text, href}: SectionProps) {
    return (
        <Link href={href}>
            <button className="w-60 rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600">
                {text}
            </button>
        </Link>
    )
}
