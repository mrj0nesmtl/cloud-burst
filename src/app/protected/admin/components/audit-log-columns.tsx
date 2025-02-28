import { ColumnDef } from "@tanstack/react-table"
import { formatDistanceToNow } from "date-fns"

export type AuditLog = {
  id: string
  action: string
  entity: string
  entityId: string
  userId: string
  metadata: Record<string, any>
  createdAt: string
}

export const auditLogColumns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "action",
    header: "Action",
  },
  {
    accessorKey: "entity",
    header: "Resource",
  },
  {
    accessorKey: "userId",
    header: "User",
  },
  {
    accessorKey: "createdAt",
    header: "Time",
    cell: ({ row }) => {
      return formatDistanceToNow(new Date(row.original.createdAt), {
        addSuffix: true,
      })
    },
  },
] 