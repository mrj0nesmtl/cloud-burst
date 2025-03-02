import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { AuditLogViewer } from '../components/audit-log-viewer'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function AuditLogsPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Audit Logs</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>System Activity</CardTitle>
          <CardDescription>
            View system activity and user actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuditLogViewer logs={logs || []} />
        </CardContent>
      </Card>
    </div>
  )
}
