import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"

export function SystemStatusDisplay() {
  // For beta, we'll show static healthy status
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">API Services</span>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Operational
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Database</span>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Operational
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Storage Services</span>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Operational
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">AI Processing</span>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Operational
          </Badge>
        </div>
      </div>

      <div className="pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          All systems are operating normally. For support, please contact our team.
        </p>
      </div>
    </div>
  )
} 