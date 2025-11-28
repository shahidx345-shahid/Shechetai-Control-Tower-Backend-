"use client"

import { useState, useEffect } from "react"
import { DollarSign, Plus, Minus, TrendingUp, Activity, Loader2 } from "lucide-react"
import { getCurrentUserToken } from "@/lib/firebase/client"
import { Dialog } from "@/components/ui/dialog-simple"
import { apiClient } from "@/lib/api/client"

export default function BillingContractsPage() {
  const [activeTab, setActiveTab] = useState<"contracts" | "invoices">("contracts")
  const [contracts, setContracts] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    teamId: "",
    planType: "starter",
    billingCycle: "monthly",
    amount: 99,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = await getCurrentUserToken()
      if (!token) return

      const [contractsRes, invoicesRes, teamsRes] = await Promise.all([
        fetch('/api/billing/contracts', { headers: { 'Authorization': `Bearer ${token}` } }),
        apiClient.getInvoices(),
        apiClient.getTeams()
      ])
      
      if (contractsRes.ok) {
        const data = await contractsRes.json()
        // Handle nested paginated response: data.data.data or data.data.items
        const contractsList = data.data?.data || data.data?.items || data.data || []
        console.log('Contracts loaded:', contractsList.length, 'contracts')
        setContracts(Array.isArray(contractsList) ? contractsList : [])
      }

      if (invoicesRes.success) {
        const invoicesList = invoicesRes.data || []
        setInvoices(Array.isArray(invoicesList) ? invoicesList : [])
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

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsSubmitting(true)

    try {
      const response = await apiClient.createContract({
        teamId: formData.teamId,
        planType: formData.planType as any,
        billingCycle: formData.billingCycle as any,
        amount: formData.amount,
        currency: "USD",
        status: "active",
        startDate: new Date().toISOString(),
      })

      if (response.success) {
        setSuccess("Contract created successfully!")
        setFormData({ teamId: "", planType: "starter", billingCycle: "monthly", amount: 99 })
        setIsCreateDialogOpen(false)
        await fetchData()
      }
    } catch (error: any) {
      setError(error.message || "Failed to create contract")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddBlock = async () => {
    try {
      const contract = contracts[0]
      const contractId = contract.contractId || contract.id
      
      const response = await apiClient.updateContract(contractId, {
        metadata: {
          ...contract.metadata,
          blocks: (contract.metadata?.blocks || 0) + 1
        }
      })

      if (response.success) {
        setSuccess("Block added successfully!")
        await fetchData()
      }
    } catch (error: any) {
      setError(error.message || "Failed to add block")
    }
  }

  const handleRemoveBlock = async () => {
    try {
      const contract = contracts[0]
      const currentBlocks = contract.metadata?.blocks || 0
      
      if (currentBlocks <= 0) {
        setError("No blocks to remove")
        return
      }

      const contractId = contract.contractId || contract.id
      
      const response = await apiClient.updateContract(contractId, {
        metadata: {
          ...contract.metadata,
          blocks: currentBlocks - 1
        }
      })

      if (response.success) {
        setSuccess("Block removed successfully!")
        await fetchData()
      }
    } catch (error: any) {
      setError(error.message || "Failed to remove block")
    }
  }

  const mockContract = contracts.length > 0 ? {
    teamId: contracts[0].teamId,
    agentId: contracts[0].agentId,
    status: contracts[0].status,
    planId: contracts[0].planType,
    billingModel: contracts[0].billingCycle || "monthly",
    capBase: 3,
    blocks: contracts[0].metadata?.blocks || 0,
    capEffective: 3 + (contracts[0].metadata?.blocks || 0) * 5,
    monthlyPrice: `$${contracts[0].amount || 99}`,
    currentPeriodEnd: contracts[0].endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subscriptionId: contracts[0].contractId || contracts[0].id,
  } : null

  const mockCatalog = [
    { id: "tier_basic", name: "Basic", capBase: 3, price: "$99" },
    { id: "tier_pro", name: "Professional", capBase: 10, price: "$299" },
    { id: "tier_enterprise", name: "Enterprise", capBase: 25, price: "$799" },
  ]

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading contracts...</p>
        </div>
      </div>
    )
  }

  if (!mockContract) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-8 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Billing & Contracts</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage agent contracts and billing configurations</p>
          </div>
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Contract</span>
          </button>
        </div>
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-400 text-sm">
            {success}
          </div>
        )}
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground mb-2">No contracts found</p>
          <p className="text-sm text-muted-foreground">Create your first contract to get started</p>
        </div>

        <Dialog
          isOpen={isCreateDialogOpen}
          onClose={() => {
            setIsCreateDialogOpen(false)
            setError("")
          }}
          title="Create Billing Contract"
        >
          <form onSubmit={handleCreateContract} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Team *</label>
              <select
                value={formData.teamId}
                onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
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
              <label className="block text-sm font-medium text-foreground mb-2">Plan Type</label>
              <select
                value={formData.planType}
                onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Billing Cycle</label>
              <select
                value={formData.billingCycle}
                onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Amount (USD)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                min={0}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                {isSubmitting ? "Creating..." : "Create Contract"}
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Billing & Contracts</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage agent contracts and billing configurations</p>
        </div>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create Contract</span>
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
        {/* Contract Status */}
        <div
          className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-fade-in-up"
          style={{ animationDelay: "0s" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h3 className="font-semibold text-sm sm:text-base text-card-foreground">Contract Status</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-primary">{mockContract.monthlyPrice}</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 font-medium">
            {mockContract.billingModel.toUpperCase()} Plan
          </p>
          <p className="text-xs text-muted-foreground mt-1">{mockContract.planId}</p>
          <div className="flex items-center gap-1 mt-4 pt-4 border-t border-border">
            <Activity className="w-3 h-3 text-green-500" />
            <span className="text-xs font-semibold text-green-400">Active</span>
          </div>
        </div>

        {/* Capacity */}
        <div
          className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <h3 className="font-semibold text-sm sm:text-base text-card-foreground mb-4">Capacity Info</h3>
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Base Capacity</span>
              <span className="font-bold text-foreground text-lg">{mockContract.capBase}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Blocks Added</span>
              <span className="font-bold text-foreground text-lg">{mockContract.blocks}</span>
            </div>
            <div className="flex justify-between items-center border-t border-border pt-3 mt-3">
              <span className="text-foreground font-semibold">Effective Capacity</span>
              <span className="text-primary font-bold text-lg">{mockContract.capEffective}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <h3 className="font-semibold text-sm sm:text-base text-card-foreground mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={handleAddBlock}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-primary text-primary-foreground rounded-lg text-xs sm:text-sm font-medium hover:bg-primary/90 hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              Add Block
            </button>
            <button 
              onClick={handleRemoveBlock}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-muted text-foreground rounded-lg text-xs sm:text-sm font-medium hover:bg-muted/80 transition-all duration-200"
            >
              <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
              Remove Block
            </button>
          </div>
        </div>
      </div>

      {/* Billing Catalog */}
      <div
        className="bg-card border border-border rounded-lg p-4 sm:p-6 animate-fade-in-up"
        style={{ animationDelay: "0.3s" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
          <h2 className="text-base sm:text-lg font-semibold text-card-foreground">Billing Catalog</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {mockCatalog.map((tier, index) => (
            <div
              key={tier.id}
              style={{
                animation: `fadeInUp 0.4s ease-out ${0.3 + index * 0.1}s both`,
              }}
              className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                tier.id === mockContract.planId
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              }`}
            >
              <p className="font-semibold text-sm sm:text-base text-card-foreground">{tier.name}</p>
              <p className="text-xl sm:text-2xl font-bold text-primary mt-2">{tier.price}</p>
              <p className="text-xs text-muted-foreground mt-2">Base: {tier.capBase} seats</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contract Details */}
      <div
        className="bg-card border border-border rounded-lg p-4 sm:p-6 animate-fade-in-up"
        style={{ animationDelay: "0.4s" }}
      >
        <h2 className="text-base sm:text-lg font-semibold text-card-foreground mb-4 sm:mb-6">Contract Details</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Team ID</p>
            <p className="font-mono text-foreground mt-1 sm:mt-2 text-xs break-all">{mockContract.teamId}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Agent ID</p>
            <p className="font-mono text-foreground mt-1 sm:mt-2 text-xs break-all">{mockContract.agentId}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Status</p>
            <p className="text-foreground font-semibold mt-1 sm:mt-2 capitalize text-green-400 text-xs">
              {mockContract.status}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Period End</p>
            <p className="text-foreground mt-1 sm:mt-2 text-xs">{mockContract.currentPeriodEnd}</p>
          </div>
        </div>
      </div>

      {/* Create Contract Dialog */}
      <Dialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false)
          setError("")
        }}
        title="Create Billing Contract"
      >
        <form onSubmit={handleCreateContract} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Team *</label>
            <select
              value={formData.teamId}
              onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
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
            <label className="block text-sm font-medium text-foreground mb-2">Plan Type</label>
            <select
              value={formData.planType}
              onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Billing Cycle</label>
            <select
              value={formData.billingCycle}
              onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Amount (USD)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              min={0}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
              {isSubmitting ? "Creating..." : "Create Contract"}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
