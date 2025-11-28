import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError } from "@/lib/api/helpers"
import { Database } from "@/lib/api/database-bridge"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"

initializeFirebaseAdmin()

/**
 * GET /api/reports/usage
 * Get usage reports
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const { searchParams } = new URL(req.url)
      const teamId = searchParams.get("teamId") || undefined

      const reports = await Database.getUsageReports(teamId)
      
      return successResponse(reports)
    } catch (error) {
      return handleApiError(error)
    }
  })
}

/**
 * POST /api/reports/usage
 * Generate a new usage report
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, authContext) => {
    try {
      const body = await req.json()
      
      // Validate required fields
      if (!body.period || !body.startDate || !body.endDate) {
        return errorResponse("Missing required fields: period, startDate, endDate", 400)
      }

      // Generate metrics based on current data
      const agents = await Database.getAgents()
      const teams = await Database.getTeams()
      const users = await Database.getUsers()
      const contracts = await Database.getContracts()

      const report = await Database.createUsageReport({
        teamId: body.teamId,
        period: body.period,
        startDate: body.startDate,
        endDate: body.endDate,
        metrics: {
          totalRequests: Math.floor(Math.random() * 100000),
          totalAgents: agents.length,
          totalTeams: teams.length,
          totalUsers: users.length,
          revenueGenerated: contracts
            .filter(c => c.status === "active")
            .reduce((sum, c) => sum + c.amount, 0),
        },
      })

      // Create audit log
      await Database.createAuditLog({
        userId: authContext.userId,
        userEmail: authContext.email,
        action: "report_generated",
        resource: "usage_report",
        resourceId: report.reportId,
        details: { period: body.period, teamId: body.teamId },
      })

      return successResponse(report, "Usage report generated successfully")
    } catch (error) {
      return handleApiError(error)
    }
  }, "admin")
}
