import { createClient } from '@/lib/supabase/client'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './audit-log-columns'

export async function AuditLogViewer() {
  const supabase = createClient()
  
  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select(`
      id,
      action,
      table_name,
      created_at,
      user_id,
      user_profiles!inner(
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">System Audit Logs</h2>
      <DataTable columns={columns} data={logs || []} />
    </div>
  )
} 