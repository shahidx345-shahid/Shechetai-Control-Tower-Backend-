"use client"

import { TrendingUp, Code, Copy, Share2, Plus, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { getCurrentUserToken } from "@/lib/firebase/client"
import { apiClient } from "@/lib/api/client"
import { Dialog } from "@/components/ui/dialog-simple"

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false)
  const [referrals, setReferrals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    referrerId: "",
    refereeId: "",
    refereeEmail: "",
    programId: "default",
    commissionRate: 20,
  })

  useEffect(() => {
    fetchReferrals()
  }, [])

  const fetchReferrals = async () => {
    try {
      const token = await getCurrentUserToken()
      if (!token) return

      const response = await apiClient.getReferrals()
      if (response.success) {
        const referralsList = response.data || []
        console.log('Referrals loaded:', referralsList)
        setReferrals(Array.isArray(referralsList) ? referralsList : [])
      }
    } catch (error) {
      console.error('Error fetching referrals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsSubmitting(true)

    try {
      const referralData = {
        referrerId: formData.referrerId,
        refereeId: formData.refereeId,
        refereeEmail: formData.refereeEmail,
        programId: formData.programId,
        status: "pending" as const,
        metadata: {
          commissionRate: formData.commissionRate,
        },
      }
      console.log('Sending referral data:', referralData)
      const response = await apiClient.createReferral(referralData)

      if (response.success) {
        setSuccess("Referral created successfully!")
        setFormData({ referrerId: "", refereeId: "", refereeEmail: "", programId: "default", commissionRate: 20 })
        setIsCreateDialogOpen(false)
        await fetchReferrals()
      }
    } catch (error: any) {
      setError(error.message || "Failed to create referral")
    } finally {
      setIsSubmitting(false)
    }
  }

  const mockReferralData = referrals.length > 0 ? {
    code: referrals[0].code || "SHECHET2024",
    referrerId: referrals[0].referrerId || "partner_001",
    rateBps: referrals[0].rateBps || 2000,
    currentMonth: {
      month: "2024-01",
      estimatedCents: referrals[0].rewardAmount || 12345,
    },
    history: [
      { month: "2024-01", totalCents: 10000, paid: false },
      { month: "2023-12", totalCents: 8500, paid: true },
      { month: "2023-11", totalCents: 7200, paid: true },
    ],
  } : {
    code: "SHECHET2024",
    referrerId: "partner_001",
    rateBps: 2000,
    currentMonth: {
      month: "2024-01",
      estimatedCents: 12345,
    },
    history: [
      { month: "2024-01", totalCents: 10000, paid: false },
      { month: "2023-12", totalCents: 8500, paid: true },
      { month: "2023-11", totalCents: 7200, paid: true },
    ],
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(mockReferralData.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading referrals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Referrals</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage referral codes and view payout status</p>
        </div>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create Referral</span>
        </button>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Referral Code */}
        <div
          className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-fade-in-up"
          style={{ animationDelay: "0s" }}
        >
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <Code className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h3 className="font-semibold text-sm sm:text-base text-card-foreground">Active Referral Code</h3>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 mb-4 flex-col sm:flex-row">
            <code className="flex-1 w-full px-3 sm:px-4 py-2 sm:py-3 bg-input border border-border rounded-lg text-foreground font-mono text-base sm:text-lg font-bold tracking-widest text-center sm:text-left">
              {mockReferralData.code}
            </code>
            <button
              onClick={handleCopy}
              className={`p-2 sm:p-2.5 rounded-lg transition-all duration-200 flex-shrink-0 ${copied ? "bg-green-500/20 text-green-400" : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 sm:pt-4 border-t border-border">
            <span>Commission Rate</span>
            <span className="font-semibold text-accent">{mockReferralData.rateBps / 100}%</span>
          </div>
        </div>

        {/* Current Month Earnings */}
        <div
          className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-accent animate-pulse-glow" />
            <h3 className="font-semibold text-sm sm:text-base text-card-foreground">Current Month Earnings</h3>
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-accent">
            ${(mockReferralData.currentMonth.estimatedCents / 100).toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-3 sm:mt-4 font-semibold">
            {mockReferralData.currentMonth.month}
          </p>
          <p className="text-xs text-muted-foreground">Estimated (pending aggregation)</p>
        </div>
      </div>

      {/* Payout History */}
      <div
        className="bg-card border border-border rounded-lg p-4 sm:p-6 animate-fade-in-up"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <h2 className="text-base sm:text-lg font-semibold text-card-foreground">Payout History</h2>
        </div>
        <div className="space-y-2">
          {mockReferralData.history.map((entry, index) => (
            <div
              key={entry.month}
              style={{
                animation: `fadeInUp 0.4s ease-out ${0.2 + index * 0.08}s both`,
              }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-3 sm:p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors duration-200"
            >
              <div>
                <p className="text-xs sm:text-sm font-semibold text-foreground">{entry.month}</p>
                <p className="text-xs text-muted-foreground">${(entry.totalCents / 100).toFixed(2)}</p>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap ${entry.paid ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                  }`}
              >
                {entry.paid ? "Paid" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Create Referral Dialog */}
      <Dialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false)
          setError("")
        }}
        title="Create Referral Code"
      >
        <form onSubmit={handleCreateReferral} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Referrer ID *</label>
            <input
              type="text"
              value={formData.referrerId}
              onChange={(e) => setFormData({ ...formData, referrerId: e.target.value })}
              placeholder="User ID who is referring"
              required
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">User ID of the referrer</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Referee ID *</label>
            <input
              type="text"
              value={formData.refereeId}
              onChange={(e) => setFormData({ ...formData, refereeId: e.target.value })}
              placeholder="User ID being referred"
              required
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">User ID of the person being referred</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Referee Email *</label>
            <input
              type="email"
              value={formData.refereeEmail}
              onChange={(e) => setFormData({ ...formData, refereeEmail: e.target.value })}
              placeholder="email@example.com"
              required
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">Email address of the referee</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Program ID *</label>
            <input
              type="text"
              value={formData.programId}
              onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
              placeholder="default"
              required
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">Referral program identifier</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Commission Rate (%)</label>
            <input
              type="number"
              value={formData.commissionRate}
              onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
              min={0}
              max={100}
              step={0.5}
              required
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">Percentage of revenue shared (0-100%)</p>
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
                setIsCreateDialogOpen(false)
                setError("")
              }}
              className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Creating..." : "Create Referral"}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
