"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Mail, Users, Send, Loader2 } from "lucide-react"
import { getCurrentUserToken } from "@/lib/firebase/client"
import { apiClient } from "@/lib/api/client"
import { Dialog } from "@/components/ui/dialog-simple"

export default function SeatsInvitesPage() {
  const [seats, setSeats] = useState<any[]>([])
  const [seatRequests, setSeatRequests] = useState<any[]>([])
  const [invites, setInvites] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Assign Member Dialog
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [assignFormData, setAssignFormData] = useState({ userId: "", email: "", role: "member" })

  // Create Invite Dialog
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const [inviteFormData, setInviteFormData] = useState({ email: "", role: "member" })

  useEffect(() => {
    fetchTeams()
  }, [])

  useEffect(() => {
    if (selectedTeamId) {
      fetchTeamData()
    }
  }, [selectedTeamId])

  const fetchTeams = async () => {
    try {
      setLoading(true)
      const token = await getCurrentUserToken()
      if (!token) return

      const response = await apiClient.getTeams()
      if (response.success) {
        const teamsList = response.data?.data || response.data || []
        setTeams(Array.isArray(teamsList) ? teamsList : [])
        
        // Auto-select first team
        if (Array.isArray(teamsList) && teamsList.length > 0) {
          const firstTeamId = teamsList[0].teamId || teamsList[0].id
          setSelectedTeamId(firstTeamId)
        }
      }
    } catch (err) {
      console.error('Error fetching teams:', err)
      setError("Failed to load teams")
    } finally {
      setLoading(false)
    }
  }

  const fetchTeamData = async () => {
    try {
      setLoading(true)
      const token = await getCurrentUserToken()
      if (!token) return

      // Fetch members for selected team
      const membersRes = await fetch(`/api/teams/${selectedTeamId}/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (membersRes.ok) {
        const data = await membersRes.json()
        const membersList = data.data?.members || data.data || []
        setSeats(Array.isArray(membersList) ? membersList : [])
      }

      // Fetch invites for selected team
      const invitesRes = await fetch(`/api/teams/${selectedTeamId}/invites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (invitesRes.ok) {
        const data = await invitesRes.json()
        const invitesList = data.data || []
        const allInvites = Array.isArray(invitesList) ? invitesList : []
        
        // Split invites into pending requests and all invites
        const pendingRequests = allInvites.filter(inv => inv.status === 'pending')
        setSeatRequests(pendingRequests)
        setInvites(allInvites)
      }

      setError("")
    } catch (err) {
      console.error('Error fetching team data:', err)
      setError("Failed to load team data")
    } finally {
      setLoading(false)
    }
  }

  const handleAssignMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsAssigning(true)

    try {
      const token = await getCurrentUserToken()
      if (!token) return

      const response = await fetch(`/api/teams/${selectedTeamId}/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assignFormData)
      })

      if (response.ok) {
        setSuccess("Member assigned successfully!")
        setAssignFormData({ userId: "", email: "", role: "member" })
        setIsAssignDialogOpen(false)
        await fetchTeamData() // Refresh list
      } else {
        const data = await response.json()
        setError(data.error || "Failed to assign member")
      }
    } catch (err: any) {
      setError(err.message || "Failed to assign member")
    } finally {
      setIsAssigning(false)
    }
  }

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsInviting(true)

    try {
      const token = await getCurrentUserToken()
      if (!token) return

      const response = await fetch(`/api/teams/${selectedTeamId}/invites`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inviteFormData)
      })

      if (response.ok) {
        setSuccess("Invite created successfully!")
        setInviteFormData({ email: "", role: "member" })
        setIsInviteDialogOpen(false)
        await fetchTeamData() // Refresh list
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create invite")
      }
    } catch (err: any) {
      setError(err.message || "Failed to create invite")
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemoveMember = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from this team?`)) {
      return
    }

    try {
      const token = await getCurrentUserToken()
      if (!token) return

      const response = await fetch(`/api/teams/${selectedTeamId}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setSuccess("Member removed successfully!")
        await fetchTeamData() // Refresh list
      } else {
        const data = await response.json()
        setError(data.error || "Failed to remove member")
      }
    } catch (err: any) {
      setError(err.message || "Failed to remove member")
    }
  }

  if (loading && teams.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading seats and invites...</p>
        </div>
      </div>
    )
  }

  if (teams.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Seats & Invites</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage team membership and seat allocations</p>
        </div>
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground mb-2">No teams found</p>
          <p className="text-sm text-muted-foreground">Create a team first to manage seats and invites</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Seats & Invites</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage team membership and seat allocations</p>
      </div>

      {/* Team Selector */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <label className="block text-sm font-semibold text-foreground mb-2">Select Team</label>
        <select
          value={selectedTeamId}
          onChange={(e) => setSelectedTeamId(e.target.value)}
          className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Choose a team...</option>
          {teams.map((team) => (
            <option key={team.teamId || team.id} value={team.teamId || team.id}>
              {team.name} ({team.teamId || team.id})
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-400 text-sm">
          {success}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading team data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Active Seats */}
          <div className="animate-fade-in-up" style={{ animation: `fadeInUp 0.4s ease-out 0s both` }}>
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <h2 className="text-base sm:text-lg font-semibold text-card-foreground">Active Seats</h2>
                </div>
                <button 
                  onClick={() => setIsAssignDialogOpen(true)}
                  disabled={!selectedTeamId}
                  className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs sm:text-sm font-medium hover:bg-primary/90 hover:shadow-lg transition-all duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Assign</span>
                </button>
              </div>
              {seats.length === 0 ? (
                <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">No active seats</p>
              ) : (
                <div className="space-y-2">
                  {seats.map((seat) => (
                    <div
                      key={seat.userId}
                      className="flex items-center justify-between p-2.5 sm:p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors duration-200 group text-xs sm:text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{seat.email || seat.userId}</p>
                        <p className="text-muted-foreground text-xs">
                          {seat.role} • {new Date(seat.joinedAt || seat.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleRemoveMember(seat.userId, seat.email || seat.userId)}
                        className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80 transition-all flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pending Seat Requests */}
          <div className="animate-fade-in-up" style={{ animation: `fadeInUp 0.4s ease-out 0.1s both` }}>
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full">
              <h2 className="text-base sm:text-lg font-semibold text-card-foreground mb-4">Pending Requests</h2>
              <div className="space-y-2">
                {seatRequests.length === 0 ? (
                  <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">No pending requests</p>
                ) : (
                  seatRequests.map((req) => (
                    <div
                      key={req.inviteId || req.id}
                      className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs sm:text-sm"
                    >
                      <p className="font-medium text-foreground">{req.email}</p>
                      <p className="text-muted-foreground text-xs">
                        {req.role} • Invited {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Expires: {new Date(req.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Team Invites */}
          <div className="animate-fade-in-up" style={{ animation: `fadeInUp 0.4s ease-out 0.2s both` }}>
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                  <h2 className="text-base sm:text-lg font-semibold text-card-foreground">Team Invites</h2>
                </div>
              <button 
                onClick={() => setIsInviteDialogOpen(true)}
                disabled={!selectedTeamId}
                className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs sm:text-sm font-medium hover:bg-primary/90 hover:shadow-lg transition-all duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Create</span>
              </button>
              </div>
              {invites.length === 0 ? (
                <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">No invites</p>
              ) : (
                <div className="space-y-2">
                  {invites.map((invite) => (
                    <div
                      key={invite.inviteId || invite.id}
                      className="flex items-center justify-between p-2.5 sm:p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors duration-200 group text-xs sm:text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{invite.email}</p>
                        <p className="text-muted-foreground text-xs">
                          {invite.role} • {invite.status}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap flex-shrink-0 ${
                          invite.status === "accepted"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {invite.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Member Dialog */}
      <Dialog
        isOpen={isAssignDialogOpen}
        onClose={() => {
          setIsAssignDialogOpen(false)
          setError("")
          setAssignFormData({ userId: "", email: "", role: "member" })
        }}
        title="Assign Team Member"
      >
        <form onSubmit={handleAssignMember} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              User ID *
            </label>
            <input
              type="text"
              value={assignFormData.userId}
              onChange={(e) => setAssignFormData({ ...assignFormData, userId: e.target.value })}
              placeholder="e.g., user_123"
              required
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email *
            </label>
            <input
              type="email"
              value={assignFormData.email}
              onChange={(e) => setAssignFormData({ ...assignFormData, email: e.target.value })}
              placeholder="user@example.com"
              required
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Role
            </label>
            <select
              value={assignFormData.role}
              onChange={(e) => setAssignFormData({ ...assignFormData, role: e.target.value })}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="member">Member</option>
              <option value="leader">Leader</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsAssignDialogOpen(false)
                setError("")
              }}
              className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
              disabled={isAssigning}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAssigning}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAssigning && <Loader2 className="w-4 h-4 animate-spin" />}
              {isAssigning ? "Assigning..." : "Assign Member"}
            </button>
          </div>
        </form>
      </Dialog>

      {/* Create Invite Dialog */}
      <Dialog
        isOpen={isInviteDialogOpen}
        onClose={() => {
          setIsInviteDialogOpen(false)
          setError("")
          setInviteFormData({ email: "", role: "member" })
        }}
        title="Create Team Invite"
      >
        <form onSubmit={handleCreateInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email *
            </label>
            <input
              type="email"
              value={inviteFormData.email}
              onChange={(e) => setInviteFormData({ ...inviteFormData, email: e.target.value })}
              placeholder="user@example.com"
              required
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              An invite email will be sent to this address
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Role
            </label>
            <select
              value={inviteFormData.role}
              onChange={(e) => setInviteFormData({ ...inviteFormData, role: e.target.value })}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="member">Member</option>
              <option value="leader">Leader</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsInviteDialogOpen(false)
                setError("")
              }}
              className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
              disabled={isInviting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isInviting}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isInviting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isInviting ? "Creating..." : "Create Invite"}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
