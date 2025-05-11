import getAuditLog from '@/utils/filtering/getAuditLog'
import AuditLogClient from './clientPage'
import config from '@parent/constants'

const { IMAGE_URL } = config

/**
 * Server side audit log to display in the user interface. Prerenders the 
 * content to ensure that it is available to the user right away. The user has 
 * filters and paging to filter the results.
 * 
 * @returns React component
 */
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

