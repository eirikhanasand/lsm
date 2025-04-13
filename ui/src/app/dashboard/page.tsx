import Section from "@/components/section"

export default function Dashboard() {
    return (
        <main className="flex min-h-full flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold text-blue-500">Dashboard</h1>
            <p className="text-foreground">Manage your library safety settings and see / edit whitelisted and blacklisted packages.</p>
            <div className="mt-4 flex flex-col space-y-2">
                <Section text="Repositories" href="/dashboard/repositories" />
                <Section text="Whitelisted Packages" href="/dashboard/whitelist" />  
                <Section text="Blacklisted Packages" href="/dashboard/blacklist" />
                <Section text="Statistics" href="/dashboard/statistics" />
                <Section text="Audit" href="/dashboard/audit" />
            </div>
        </main>
    )
}
