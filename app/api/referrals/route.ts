import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError } from "@/lib/api/helpers"
import { Database } from "@/lib/api/database-bridge"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"

initializeFirebaseAdmin()

/**
 * GET /api/referrals
 * Get referrals with optional filters
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const { searchParams } = new URL(req.url)
      
      const filters = {
        referrerId: searchParams.get("referrerId") || undefined,
        status: searchParams.get("status") || undefined,
      }

      const referrals = await Database.getReferrals(filters)
      
      return successResponse(referrals)
    } catch (error) {
      return handleApiError(error)
    }
  })
}

/**
 * POST /api/referrals
 * Create a new referral
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const body = await req.json()
      console.log('Received referral data:', body)
      
      // Validate required fields
      if (!body.referrerId || !body.refereeId || !body.refereeEmail || !body.programId) {
        console.log('Missing fields - body:', JSON.stringify(body))
        return errorResponse("Missing required fields: referrerId, refereeId, refereeEmail, programId", 400)
      }

      const referral = await Database.createReferral({
        referrerId: body.referrerId,
        refereeId: body.refereeId,
        refereeEmail: body.refereeEmail,
        programId: body.programId,
        status: body.status || "pending",
        metadata: body.metadata,
      })

      return successResponse(referral, "Referral created successfully")
    } catch (error) {
      return handleApiError(error)
    }
  })
}
