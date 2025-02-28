import { Suspense } from 'react'
import { createServerClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserRole } from '@/types/auth'
import { formatDistanceToNow } from 'date-fns'

// User List Component with Server Actions
async function UserList() {
  const supabase = createServerClient()
  
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (!users?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No users found
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Username</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.username}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>
              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                user.status === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {user.status}
              </span>
            </TableCell>
            <TableCell>{formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</TableCell>
            <TableCell>
              <Button 
                variant="ghost" 
                size="sm"
                asChild
              >
                <a href={`/protected/admin/users/${user.id}`}>
                  Edit
                </a>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// Search and Filter Section
function UserFilters() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 max-w-sm">
        <Input 
          placeholder="Search users..." 
          type="search"
        />
      </div>
      <Button>
        Add User
      </Button>
    </div>
  )
}

export default async function UsersPage() {
  const supabase = createServerClient()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View and manage user accounts, roles, and permissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <UserFilters />
          <Suspense fallback={<LoadingSpinner />}>
            <UserList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
