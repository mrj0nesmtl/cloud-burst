import { createServerClient } from '@/lib/supabase/client'
import { AuditLogViewer } from '../components/audit-log-viewer'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function AuditLogsPage() {
  const supabase = createServerClient()
  
  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
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
