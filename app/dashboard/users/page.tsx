"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog-simple"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, UserPlus, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface User {
  id: string
  email: string
  name?: string
  role?: string
  status?: string
  teamId?: string
  plan?: string
  createdAt?: string
  updatedAt?: string
}

export default function UsersPage() {

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [addSuccess, setAddSuccess] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', role: 'member', teamId: '' })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/users', {
        headers: {
          'x-api-key': 'shechetai_super_secret_key_2025',
        },
      })
      if (!response.ok) throw new Error(`Failed to fetch users: ${response.statusText}`)
      const data = await response.json()
      if (data.success && data.data) {
        const usersArray = Array.isArray(data.data) ? data.data : data.data.data || []
        setUsers(usersArray)
      } else throw new Error('Invalid response format')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const getRoleBadgeColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'destructive'
      case 'owner': return 'default'
      case 'member': return 'secondary'
      default: return 'outline'
    }
  }
  const getStatusBadgeColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'default'
      case 'inactive': return 'secondary'
      case 'suspended': return 'destructive'
      default: return 'outline'
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddLoading(true)
    setAddError(null)
    setAddSuccess(null)
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'shechetai_super_secret_key_2025',
        },
        body: JSON.stringify(form),
      })
      if (!response.ok) throw new Error(`Failed to add user: ${response.statusText}`)
      const data = await response.json()
      if (data.success) {
        setAddSuccess('User added successfully!')
        setForm({ name: '', email: '', role: 'member', teamId: '' })
        fetchUsers()
        setTimeout(() => { setAddOpen(false); setAddSuccess(null) }, 1200)
      } else throw new Error(data.message || 'Failed to add user')
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add user')
    } finally {
      setAddLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Users</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage all users across your organization
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Add User Dialog */}
      <Dialog
        isOpen={addOpen}
        onClose={() => { setAddOpen(false); setAddError(null); setAddSuccess(null) }}
        title="Add User"
        description="Create a new user account"
        size="sm"
      >
        <form className="space-y-4" onSubmit={handleAddUser}>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 text-sm"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 text-sm"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              required
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Team ID</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 text-sm"
              value={form.teamId}
              onChange={e => setForm(f => ({ ...f, teamId: e.target.value }))}
              required
            />
          </div>
          {addError && <div className="text-destructive text-sm">{addError}</div>}
          {addSuccess && <div className="text-green-600 text-sm">{addSuccess}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setAddOpen(false)} disabled={addLoading}>Cancel</Button>
            <Button type="submit" disabled={addLoading}>
              {addLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
              Add User
            </Button>
          </div>
        </form>
      </Dialog>

      <Card className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                {users.length} {users.length === 1 ? 'user' : 'users'} total
              </CardDescription>
            </div>
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm whitespace-nowrap">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-sm whitespace-nowrap">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-sm whitespace-nowrap">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-sm whitespace-nowrap">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-sm whitespace-nowrap">Team ID</th>
                    <th className="text-left py-3 px-4 font-medium text-sm whitespace-nowrap">Plan</th>
                    <th className="text-left py-3 px-4 font-medium text-sm whitespace-nowrap">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium">{user.name || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">{user.id}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">{user.email}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge variant={getRoleBadgeColor(user.role)}>
                          {user.role || 'member'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge variant={getStatusBadgeColor(user.status)}>
                          {user.status || 'active'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-sm text-muted-foreground">
                          {user.teamId || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-sm">{user.plan || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">
                        {user.createdAt 
                          ? new Date(user.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
