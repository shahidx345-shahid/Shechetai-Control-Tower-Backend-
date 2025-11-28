import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError } from "@/lib/api/helpers"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"
import { WalletDatabase, TeamDatabase } from "@/lib/api/firestore"

// Initialize Firebase Admin
initializeFirebaseAdmin()

/**
 * GET /api/wallets
 * Get wallets - all wallets or by teamId (query parameter)
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const { searchParams } = new URL(req.url)
      const teamId = searchParams.get("teamId")

      if (teamId) {
        // Get wallet for specific team
        const wallet = await WalletDatabase.getByEntity(teamId, "team")
        
        if (!wallet) {
          return errorResponse("Wallet not found", 404)
        }

        return successResponse(wallet)
      } else {
        // Get all wallets
        const wallets = await WalletDatabase.getAll()
        return successResponse(wallets)
      }
    } catch (error) {
      return handleApiError(error)
    }
  })
}

/**
 * POST /api/wallets
 * Create a new wallet for a team
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const body = await req.json()
      
      // Validate required fields
      if (!body.teamId) {
        return errorResponse("Missing required field: teamId", 400)
      }

      // Check if team exists
      const team = await TeamDatabase.getById(body.teamId)
      if (!team) {
        return errorResponse("Team not found", 404)
      }

      // Check if wallet already exists
      const existingWallet = await WalletDatabase.getByEntity(body.teamId, "team")
      if (existingWallet) {
        return errorResponse("Wallet already exists for this team", 400)
      }

      const wallet = await WalletDatabase.create({
        teamId: body.teamId,
        balance: body.balance || 0,
        currency: body.currency || "credits",
        status: body.status || "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        entityId: body.teamId,
        entityType: "team",
      } as any)

      return successResponse(wallet, "Wallet created successfully")
    } catch (error) {
      return handleApiError(error)
    }
  })
}
