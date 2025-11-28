"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { apiClient } from "@/lib/api/client"

interface InviteData {
  id: string
  teamId: string
  email: string
  role: string
  status: string
  expiresAt: string
  teamName?: string
}

export default function InviteAcceptPage() {
  const params = useParams()
  const router = useRouter()
  const inviteId = params.inviteId as string

  const [invite, setInvite] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchInvite()
  }, [inviteId])

  async function fetchInvite() {
    try {
      setLoading(true)
      setError(null)

      // Fetch invite details
      const response = await fetch(`/api/invites/${inviteId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Invite not found or has expired")
        }
        throw new Error("Failed to load invite")
      }

      const response_data = await response.json()
      const inviteData = response_data.data || response_data
      
      // Check if invite is still valid
      if (inviteData.status !== "pending") {
        setError("This invite has already been used or cancelled")
        setLoading(false)
        return
      }

      if (new Date(inviteData.expiresAt) < new Date()) {
        setError("This invite has expired")
        setLoading(false)
        return
      }

      // Fetch team details
      try {
        const teamResponse = await fetch(`/api/teams/${inviteData.teamId}`)
        if (teamResponse.ok) {
          const teamData = await teamResponse.json()
          const team = teamData.data || teamData
          inviteData.teamName = team.name
        }
      } catch (e) {
        console.error("Failed to fetch team details:", e)
      }

      setInvite(inviteData)
    } catch (err: any) {
      setError(err.message || "Failed to load invite")
    } finally {
      setLoading(false)
    }
  }

  async function handleAccept() {
    try {
      setAccepting(true)
      setError(null)

      const response = await fetch(`/api/invites/${inviteId}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to accept invite")
      }

      setSuccess(true)
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Failed to accept invite")
    } finally {
      setAccepting(false)
    }
  }

  async function handleDecline() {
    try {
      setAccepting(true)
      setError(null)

      const response = await fetch(`/api/invites/${inviteId}/decline`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to decline invite")
      }

      router.push("/")
    } catch (err: any) {
      setError(err.message || "Failed to decline invite")
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading invite...</p>
        </div>
      </div>
    )
  }

  if (error && !invite) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-destructive" />
              <CardTitle>Invalid Invite</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push("/")} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <CardTitle>Invite Accepted!</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You've successfully joined the team. Redirecting to dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Team Invitation</CardTitle>
          <CardDescription>
            You've been invited to join a team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Team</p>
              <p className="font-medium">{invite?.teamName || "Loading..."}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium capitalize">{invite?.role}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{invite?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expires</p>
              <p className="font-medium">
                {invite ? new Date(invite.expiresAt).toLocaleDateString() : "-"}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleAccept}
              disabled={accepting}
              className="flex-1"
            >
              {accepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                "Accept Invitation"
              )}
            </Button>
            <Button
              onClick={handleDecline}
              disabled={accepting}
              variant="outline"
              className="flex-1"
            >
              Decline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
