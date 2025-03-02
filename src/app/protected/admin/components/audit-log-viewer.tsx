"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { AuditLog, auditLogColumns } from "./audit-log-columns"

interface AuditLogViewerProps {
  logs: AuditLog[]
}

export function AuditLogViewer({ logs }: AuditLogViewerProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow key="header-row">
              {auditLogColumns.map((column) => (
                <TableHead key={column.id}>
                  {typeof column.header === "string"
                    ? column.header
                    : column.id}
                </TableHead>
              ))}
              <TableHead key="actions">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <TableRow key={log.id}>
                  {auditLogColumns.map((column) => (
                    <TableCell key={column.id}>
                      {column.cell
                        ? column.cell({ row: { original: log } })
                        : log[column.accessorKey as keyof AuditLog]}
                    </TableCell>
                  ))}
                  <TableCell key="actions-cell">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow key="no-data-row">
                <TableCell colSpan={auditLogColumns.length + 1} className="text-center py-6">
                  No audit logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 