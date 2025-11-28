import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError } from "@/lib/api/helpers"
import { Database } from "@/lib/api/database-bridge"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"

initializeFirebaseAdmin()

/**
 * GET /api/billing/invoices
 * List all invoices
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const { searchParams } = new URL(req.url)
      const teamId = searchParams.get("teamId") || undefined

      const invoices = await Database.getInvoices(teamId)
      
      return successResponse(invoices)
    } catch (error) {
      return handleApiError(error)
    }
  })
}

/**
 * POST /api/billing/invoices
 * Create a new invoice
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const body = await req.json()
      
      // Validate required fields
      if (!body.contractId || !body.teamId || body.amount === undefined) {
        return errorResponse("Missing required fields: contractId, teamId, amount", 400)
      }

      const invoice = await Database.createInvoice({
        contractId: body.contractId,
        teamId: body.teamId,
        amount: body.amount,
        currency: body.currency || "USD",
        status: body.status || "pending",
        issueDate: body.issueDate || new Date().toISOString(),
        dueDate: body.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: body.metadata,
      })

      return successResponse(invoice, "Invoice created successfully")
    } catch (error) {
      return handleApiError(error)
    }
  })
}
