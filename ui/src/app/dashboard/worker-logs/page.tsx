import fetchWorkerLogs from "@/utils/fetchWorkersLogs"

export type WorkerLog = {
  id: number
  timestamp: string
  log_message: string
  worker_name: string
}

export default async function WorkerLogsPage() {
    const logs: WorkerLog[] = await fetchWorkerLogs()

    return (
        <main className="min-h-full w-full flex flex-col p-4">
            <h1 className="text-3xl font-bold text-blue-600">Worker Logs</h1>
            <p className="mt-2 text-foreground mb-2">List of worker logs recorded from the system.</p>
      
            <div className="grid grid-cols-4 bg-normal w-full h-[50px] items-center pl-4 text-foreground">
                <h1>ID</h1>
                <h1>Timestamp</h1>
                <h1>Worker</h1>
                <h1>Message</h1>
            </div>
            <div className="w-full">
                {logs.map((log, index) => (
                    <WorkerLogRow key={log.id} log={log} index={index} />
                ))}
            </div>
        </main>
    )
}

type WorkerLogRowProps = {
  log: WorkerLog
  index: number
}

function WorkerLogRow({ log, index }: WorkerLogRowProps) {
    const bgColor = index % 2 !== 0 ? "bg-normal" : ""
    return (
        <div className={`w-full grid grid-cols-4 ${bgColor} p-4 text-foreground`}>
            <div>{log.id}</div>
            <div>{new Date(log.timestamp).toLocaleString()}</div>
            <div>{log.worker_name}</div>
            <div>{log.log_message}</div>
        </div>
    )
}
