import Link from "next/link"

type SectionProps = {
    text: string
    href: string
}

export default function Dashboard() {
    return (
        <main className="flex min-h-full flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold text-blue-500">Dashboard</h1>
            <p className="text-foreground">Manage your library safety settings and see/edit whitelisted and blacklisted packages.</p>
            <div className="mt-4 flex flex-col space-y-2">
                <Section text="Repositories" href="/dashboard/repositories" />
                <Section text="Whitelisted Packages" href="/dashboard/whitelist" />  
                <Section text="Blacklisted Packages" href="/dashboard/blacklist" />
                <Section text="Statistics" href="/dashboard/statistics" />
                <Section text="Settings" href="/dashboard/settings" />
            </div>
        </main>
    )
}

function Section({text, href}: SectionProps) {
    return (
        <Link href={href}>
            <button className="w-60 rounded-lg bg-blue-500 px-6 py-2 text-sm text-white hover:bg-blue-600">
                {text}
            </button>
        </Link>
    )
}
