import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from "date-fns"
import { getInitials } from "@/lib/utils"
import { prisma } from '@/lib/prisma'
import { DeleteUserButton } from './delete-user-button'
import { EditUserButton } from './edit-user-button'

export default async function AdminUsersPage() {
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'delvin'

  const users = await prisma.user.findMany({
    where: {
      username: {
        notIn: ['portfolio_admin', ADMIN_USERNAME]
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Chat Users</h1>
        <p className="text-slate-400 mt-2 font-light">
          Manage and view all registered users in the chat system.
        </p>
      </div>

      <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-white">Registered Users ({users.length})</CardTitle>
          <CardDescription className="text-slate-400">
            A list of all users who have created an account to chat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-slate-400">User</TableHead>
                  <TableHead className="text-slate-400 text-center">Username</TableHead>
                  <TableHead className="text-slate-400 text-center">Joined</TableHead>
                  <TableHead className="text-slate-400 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="font-medium text-white">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 rounded-full bg-primary/20">
                          <AvatarImage src={user.profileImage || undefined} alt={user.name} />
                          <AvatarFallback className="rounded-full bg-primary/20 text-primary">{getInitials(user.name || user.username)}</AvatarFallback>
                        </Avatar>
                        <span className="truncate">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300 text-center truncate">@{user.username}</TableCell>
                    <TableCell className="text-center text-slate-400 text-sm whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString('en-GB')}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <EditUserButton userId={user.id} initialName={user.name} initialUsername={user.username} />
                        <DeleteUserButton userId={user.id} userName={user.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-slate-400">
                      No users registered yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
