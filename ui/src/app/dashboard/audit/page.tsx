import getAuditLog from '@/utils/filtering/getAuditLog'
import AuditLogClient from './clientPage'
import config from '@parent/constants'

const { IMAGE_URL } = config

export default async function page() {
    const auditLog: AuditProps = await getAuditLog({side: 'server'})
    return (
        <main className='min-h-full w-full flex flex-col p-4'>
            <AuditLogClient 
                pages={auditLog.pages}
                logs={auditLog.results}
                url={IMAGE_URL}    
            />
        </main>
    )
}

