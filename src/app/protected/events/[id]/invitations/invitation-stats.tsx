import { 
  Mail,
  CheckCircle2,
  XCircle, 
  Clock,
  Eye,
  Users
} from 'lucide-react'

type InvitationStats = {
  total: number
  pending: number
  opened: number
  accepted: number
  declined: number
}

export default function InvitationStats({ stats }: { stats: InvitationStats }) {
  // Calculate response rate (opened + accepted + declined) / total
  const responseRate = stats.total > 0 
    ? Math.round(((stats.accepted + stats.declined) / stats.total) * 100) 
    : 0
  
  // Calculate open rate (opened + accepted + declined) / total
  const openRate = stats.total > 0 
    ? Math.round(((stats.opened + stats.accepted + stats.declined) / stats.total) * 100) 
    : 0
  
  // Calculate acceptance rate
  const acceptanceRate = (stats.accepted + stats.declined) > 0 
    ? Math.round((stats.accepted / (stats.accepted + stats.declined)) * 100) 
    : 0
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={<Mail className="h-5 w-5 text-blue-500" />}
          label="Total"
          value={stats.total}
          helpText="All invitations sent"
        />
        <StatCard 
          icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
          label="Accepted"
          value={stats.accepted}
          helpText="Guest attending"
        />
        <StatCard 
          icon={<XCircle className="h-5 w-5 text-red-500" />}
          label="Declined"
          value={stats.declined}
          helpText="Guest not attending"
        />
        <StatCard 
          icon={<Eye className="h-5 w-5 text-yellow-500" />}
          label="Opened"
          value={stats.opened}
          helpText="Viewed but no response"
        />
      </div>
      
      <div className="space-y-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          Response Summary
        </h4>
        
        <div className="space-y-4">
          <ProgressStat 
            label="Response Rate" 
            value={responseRate} 
            color="bg-green-500"
            helpText={`${stats.accepted + stats.declined} of ${stats.total} guests responded`}
          />
          
          <ProgressStat 
            label="Open Rate" 
            value={openRate} 
            color="bg-blue-500"
            helpText={`${stats.opened + stats.accepted + stats.declined} of ${stats.total} guests opened`}
          />
          
          <ProgressStat 
            label="Acceptance Rate" 
            value={acceptanceRate} 
            color="bg-primary"
            helpText={`${stats.accepted} of ${stats.accepted + stats.declined} responded yes`}
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  icon, 
  label, 
  value, 
  helpText 
}: { 
  icon: React.ReactNode
  label: string
  value: number
  helpText: string
}) {
  return (
    <div className="bg-card rounded-lg border p-3 flex flex-col">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {icon}
      </div>
      <div className="mt-1">
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{helpText}</p>
    </div>
  )
}

function ProgressStat({ 
  label, 
  value, 
  color, 
  helpText 
}: { 
  label: string
  value: number
  color: string
  helpText: string
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-medium">{value}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div 
          className={`${color} h-2 rounded-full`} 
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{helpText}</p>
    </div>
  )
} 