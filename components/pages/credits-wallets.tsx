"use client"

import { useState, useEffect } from "react"
import { Zap, RefreshCw, ShoppingCart, TrendingUp, Plus, Loader2 } from "lucide-react"
import { getCurrentUserToken } from "@/lib/firebase/client"
import { apiClient } from "@/lib/api/client"
import { Dialog } from "@/components/ui/dialog-simple"

export default function CreditsWalletsPage() {
  const [wallets, setWallets] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isGrantDialogOpen, setIsGrantDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [grantFormData, setGrantFormData] = useState({
    teamId: "",
    amount: 1000,
    reason: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = await getCurrentUserToken()
      if (!token) return

      const [walletsRes, teamsRes] = await Promise.all([
        fetch('/api/wallets', { headers: { 'Authorization': `Bearer ${token}` } }),
        apiClient.getTeams()
      ])
      
      if (walletsRes.ok) {
        const data = await walletsRes.json()
        const walletsList = data.data || []
        console.log('Wallets loaded:', Array.isArray(walletsList) ? walletsList.length : 'not array', walletsList)
        setWallets(Array.isArray(walletsList) ? walletsList : [])
      }

      if (teamsRes.success) {
        const teamsList = teamsRes.data?.data || teamsRes.data || []
        setTeams(Array.isArray(teamsList) ? teamsList : [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGrantCredits = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsSubmitting(true)

    try {
      const response = await apiClient.grantCredits({
        teamId: grantFormData.teamId,
        amount: grantFormData.amount,
        reason: grantFormData.reason || "Manual credit grant",
      })

      if (response.success) {
        setSuccess(`Successfully granted ${grantFormData.amount} credits!`)
        setGrantFormData({ teamId: "", amount: 1000, reason: "" })
        setIsGrantDialogOpen(false)
        await fetchData()
      }
    } catch (error: any) {
      setError(error.message || "Failed to grant credits")
    } finally {
      setIsSubmitting(false)
    }
  }

  const mockWallet = wallets.length > 0 ? {
    balance: wallets[0].balance || 10000,
    currency: wallets[0].currency || "usd",
    autoRefillEnabled: wallets[0].autoRefill?.enabled || true,
    floor: wallets[0].autoRefill?.floor || 1000,
    refillTo: wallets[0].autoRefill?.refillTo || 10000,
    lastRefill: "2 hours ago",
  } : null

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading wallets...</p>
        </div>
      </div>
    )
  }

  if (!mockWallet) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-8 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Credits & Wallets</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage wallet balances and auto-refill configurations
            </p>
          </div>
          <button
            onClick={() => setIsGrantDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Grant Credits</span>
          </button>
        </div>
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-400 text-sm">
            {success}
          </div>
        )}
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground mb-2">No wallets found</p>
          <p className="text-sm text-muted-foreground">Wallets are automatically created when you create teams. Grant credits to existing teams.</p>
        </div>

        <Dialog
          isOpen={isGrantDialogOpen}
          onClose={() => {
            setIsGrantDialogOpen(false)
            setError("")
          }}
          title="Grant Credits"
        >
          <form onSubmit={handleGrantCredits} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Team *</label>
              <select
                value={grantFormData.teamId}
                onChange={(e) => setGrantFormData({ ...grantFormData, teamId: e.target.value })}
                required
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a team...</option>
                {teams.map((team) => (
                  <option key={team.teamId || team.id} value={team.teamId || team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Amount (credits)</label>
              <input
                type="number"
                value={grantFormData.amount}
                onChange={(e) => setGrantFormData({ ...grantFormData, amount: Number(e.target.value) })}
                min={1}
                required
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">Amount in credits (e.g., 1000 = $10.00)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Reason (Optional)</label>
              <textarea
                value={grantFormData.reason}
                onChange={(e) => setGrantFormData({ ...grantFormData, reason: e.target.value })}
                placeholder="Promotional credits, bonus, etc..."
                rows={3}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
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
                  setIsGrantDialogOpen(false)
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
                {isSubmitting ? "Granting..." : "Grant Credits"}
              </button>
            </div>
          </form>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Credits & Wallets</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage wallet balances and auto-refill configurations
          </p>
        </div>
        <button
          onClick={() => setIsGrantDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Grant Credits</span>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Wallet Balance */}
        <div
          className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 animate-fade-in-up"
          style={{ animationDelay: "0s" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-accent animate-pulse-glow" />
            <h3 className="font-semibold text-sm sm:text-base text-card-foreground">Wallet Balance</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-accent">${(mockWallet.balance / 100).toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-2 font-medium">USD</p>
          <p className="text-xs text-muted-foreground mt-3">Last refill: {mockWallet.lastRefill}</p>
        </div>

        {/* Auto-Refill Status */}
        <div
          className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw
              className={`w-4 h-4 sm:w-5 sm:h-5 text-primary ${mockWallet.autoRefillEnabled ? "animate-pulse-glow" : ""}`}
            />
            <h3 className="font-semibold text-sm sm:text-base text-card-foreground">Auto-Refill</h3>
          </div>
          <p
            className={`text-sm font-bold text-base sm:text-lg ${mockWallet.autoRefillEnabled ? "text-green-400" : "text-muted-foreground"}`}
          >
            {mockWallet.autoRefillEnabled ? "Enabled" : "Disabled"}
          </p>
          <p className="text-xs text-muted-foreground mt-4 font-semibold">Configuration</p>
          <div className="space-y-1 mt-2 text-xs">
            <p className="text-muted-foreground">Floor: ${(mockWallet.floor / 100).toFixed(2)}</p>
            <p className="text-muted-foreground">Refill To: ${(mockWallet.refillTo / 100).toFixed(2)}</p>
          </div>
        </div>

        {/* Purchase Pack */}
        <div
          className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h3 className="font-semibold text-sm sm:text-base text-card-foreground">Purchase Credits</h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">Buy additional credit packs</p>
          <button 
            onClick={() => setIsGrantDialogOpen(true)}
            className="w-full px-3 py-2.5 bg-primary text-primary-foreground rounded-lg text-xs sm:text-sm font-medium hover:bg-primary/90 hover:shadow-lg transition-all duration-200"
          >
            Grant Credits
          </button>
        </div>
      </div>

      {/* Configuration */}
      <div
        className="bg-card border border-border rounded-lg p-4 sm:p-6 animate-fade-in-up"
        style={{ animationDelay: "0.3s" }}
      >
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
          <h2 className="text-base sm:text-lg font-semibold text-card-foreground">Auto-Refill Configuration</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="text-xs sm:text-sm font-semibold text-muted-foreground">Floor Amount (USD)</label>
            <input
              type="number"
              defaultValue={mockWallet.floor}
              className="w-full mt-2 px-3 sm:px-4 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
            <p className="text-xs text-muted-foreground mt-1">Balance below this triggers refill</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm font-semibold text-muted-foreground">Refill To Amount (USD)</label>
            <input
              type="number"
              defaultValue={mockWallet.refillTo}
              className="w-full mt-2 px-3 sm:px-4 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
            <p className="text-xs text-muted-foreground mt-1">Target balance after refill</p>
          </div>
        </div>
      </div>

      {/* Grant Credits Dialog */}
      <Dialog
        isOpen={isGrantDialogOpen}
        onClose={() => {
          setIsGrantDialogOpen(false)
          setError("")
        }}
        title="Grant Credits"
      >
        <form onSubmit={handleGrantCredits} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Team *</label>
            <select
              value={grantFormData.teamId}
              onChange={(e) => setGrantFormData({ ...grantFormData, teamId: e.target.value })}
              required
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a team...</option>
              {teams.map((team) => (
                <option key={team.teamId || team.id} value={team.teamId || team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Amount (credits)</label>
            <input
              type="number"
              value={grantFormData.amount}
              onChange={(e) => setGrantFormData({ ...grantFormData, amount: Number(e.target.value) })}
              min={1}
              required
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">Amount in credits (e.g., 1000 = $10.00)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Reason (Optional)</label>
            <textarea
              value={grantFormData.reason}
              onChange={(e) => setGrantFormData({ ...grantFormData, reason: e.target.value })}
              placeholder="Promotional credits, bonus, etc..."
              rows={3}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
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
                setIsGrantDialogOpen(false)
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
              {isSubmitting ? "Granting..." : "Grant Credits"}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
