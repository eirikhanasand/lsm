import { API } from "@parent/constants"

export type WorkerLog = {
  id: number;
  timestamp: string;
  log_message: string;
  worker_name: string;
};

export default async function fetchWorkerLogs(): Promise<WorkerLog[]> {
    const response = await fetch(`${API}/worker-logs`, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error('Failed to fetch worker logs');
    }
    const data = await response.json();
    return data;
}
