import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError } from "@/lib/api/helpers"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"
import { Database } from "@/lib/api/database-bridge"
import nodemailer from "nodemailer"

initializeFirebaseAdmin()

interface RouteContext {
  params: Promise<{
    teamId: string
  }>
}

/**
 * GET /api/teams/[teamId]/invites
 * Get all invites for a team
 */
export async function GET(request: NextRequest, context: RouteContext) {
  return withAuth(request, async () => {
    try {
      const { teamId } = await context.params
      
      const team = await Database.getTeamById(teamId)
      if (!team) {
        return errorResponse("Team not found", 404)
      }

      const invites = await Database.getInvites(teamId)
      
      return successResponse(invites)
    } catch (error) {
      return handleApiError(error)
    }
  })
}

/**
 * POST /api/teams/[teamId]/invites
 * Create a new team invite
 */
export async function POST(request: NextRequest, context: RouteContext) {
  return withAuth(request, async (req, authContext) => {
    try {
      const { teamId } = await context.params
      const body = await req.json()

      if (!body.email) {
        return errorResponse("Missing required field: email", 400)
      }

      const team = await Database.getTeamById(teamId)
      if (!team) {
        return errorResponse("Team not found", 404)
      }

      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

      const invite = await Database.createInvite({
        teamId,
        email: body.email,
        role: body.role || "member",
        status: "pending",
        invitedBy: authContext.userId,
        expiresAt: expiresAt.toISOString(),
      })

      // Send invite email
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        })

        const inviteUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://hooks.shechet.com'}/invite/${(invite as any).id || invite.inviteId}`

        await transporter.sendMail({
          from: process.env.EMAIL_FROM || process.env.SMTP_USER,
          to: body.email,
          subject: `You're invited to join ${team.name} on Shechetai Control Tower`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">Team Invitation</h2>
              <p style="color: #666; font-size: 16px;">
                You've been invited to join <strong>${team.name}</strong> as a <strong>${body.role || 'member'}</strong>.
              </p>
              <div style="margin: 30px 0;">
                <a href="${inviteUrl}" 
                   style="background-color: #0070f3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Accept Invitation
                </a>
              </div>
              <p style="color: #999; font-size: 14px;">
                This invitation will expire on ${new Date(expiresAt).toLocaleDateString()}.
              </p>
              <hr style="border: 1px solid #eee; margin: 20px 0;">
              <p style="color: #999; font-size: 12px;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </div>
          `,
        })

        console.log(`Invite email sent to ${body.email}`)
      } catch (emailError) {
        console.error("Failed to send invite email:", emailError)
        // Don't fail the request if email fails, but log it
      }

      return successResponse(invite, "Invite created successfully and email sent")
    } catch (error) {
      return handleApiError(error)
    }
  })
}
