import { ColumnDef } from "@tanstack/react-table"
import { formatDistanceToNow } from "date-fns"

type AuditLog = {
  id: string
  action: string
  table_name: string
  created_at: string
  user_profiles: {
    full_name: string
    email: string
  }
}

export const columns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "action",
    header: "Action"
  },
  {
    accessorKey: "table_name",
    header: "Resource"
  },
  {
    accessorKey: "user_profiles.full_name",
    header: "User"
  },
  {
    accessorKey: "created_at",
    header: "When",
    cell: ({ row }) => {
      return formatDistanceToNow(new Date(row.original.created_at), { 
        addSuffix: true 
      })
    }
  }
] 