"use client"

import { Globe, Plus, Trash2, Copy, Check, AlertCircle, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api/client"
import { Dialog } from "@/components/ui/dialog-simple"

export default function WhiteLabelPage() {
  const [newDomain, setNewDomain] = useState("")
  const [copiedDns, setCopiedDns] = useState<string | null>(null)
  const [whiteLabels, setWhiteLabels] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    teamId: "",
    domain: "",
    brandName: "",
    logoUrl: "",
    primaryColor: "#0EA5E9",
    secondaryColor: "#06B6D4",
  })

  useEffect(() => {
    fetchWhiteLabels()
    fetchTeams()
  }, [])

  const fetchWhiteLabels = async () => {
    try {
      const response = await apiClient.getWhiteLabelConfigs()
      if (response.success) {
        setWhiteLabels(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching white-labels:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeams = async () => {
    try {
      const response = await apiClient.getTeams()
      if (response.success) {
        const teamsList = response.data?.data || response.data || []
        setTeams(Array.isArray(teamsList) ? teamsList : [])
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    }
  }

  const handleCreateWhiteLabel = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsSubmitting(true)

    try {
      const response = await apiClient.createWhiteLabelConfig({
        teamId: formData.teamId,
        domain: formData.domain,
        brandName: formData.brandName,
        logoUrl: formData.logoUrl || undefined,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        status: "pending",
      })

      if (response.success) {
        setSuccess("White-label domain requested successfully!")
        setFormData({
          teamId: "",
          domain: "",
          brandName: "",
          logoUrl: "",
          primaryColor: "#0EA5E9",
          secondaryColor: "#06B6D4",
        })
        setIsCreateDialogOpen(false)
        await fetchWhiteLabels()
      }
    } catch (error: any) {
      setError(error.message || "Failed to create white-label configuration")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteWhiteLabel = async (configId: string, domain: string) => {
    if (!confirm(`Are you sure you want to delete the domain "${domain}"?`)) {
      return
    }

    try {
      const response = await apiClient.deleteWhiteLabelConfig(configId)
      if (response.success) {
        setSuccess("Domain deleted successfully!")
        await fetchWhiteLabels()
      }
    } catch (error: any) {
      setError(error.message || "Failed to delete domain")
    }
  }

  const getDnsConfig = (domain: string) => ({
    cname: `${domain} CNAME edge.shechetai.com`,
    txt: `_wl.${domain} TXT verification_token_here`,
  })

  const handleCopyDns = (key: string, value: string) => {
    navigator.clipboard.writeText(value)
    setCopiedDns(key)
    setTimeout(() => setCopiedDns(null), 2000)
  }

  const getTeamName = (teamId: string) => {
    const team = teams.find((t) => t.teamId === teamId || t.id === teamId)
    return team?.name || teamId
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">White-Label Domains & Retail</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage custom domains and retail configurations for agents
        </p>
      </div>

      {/* Domain Request */}
      <div
        className="bg-card border border-border rounded-lg p-4 sm:p-6 animate-fade-in-up"
        style={{ animationDelay: "0s" }}
      >
        <h2 className="text-base sm:text-lg font-semibold text-card-foreground mb-4">Request New Domain</h2>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 sm:py-2.5 bg-primary text-primary-foreground rounded-lg text-xs sm:text-sm font-medium hover:bg-primary/90 hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          Request Domain
        </button>
      </div>

      {/* DNS Instructions - Show only if there are domains */}
      {whiteLabels.length > 0 && (
        <div
          className="bg-card border border-border rounded-lg p-4 sm:p-6 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
            <h2 className="text-base sm:text-lg font-semibold text-card-foreground">DNS Configuration Instructions</h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">
            Configure these DNS records for each domain you request:
          </p>
          <div className="space-y-3 sm:space-y-5 text-xs sm:text-sm">
            <div className="p-3 sm:p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-muted-foreground font-semibold mb-2">CNAME Record</p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
                <code className="flex-1 w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-input border border-border rounded text-foreground font-mono text-xs break-all">
                  your-domain.com CNAME edge.shechetai.com
                </code>
              </div>
            </div>
            <div className="p-3 sm:p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-muted-foreground font-semibold mb-2">TXT Record (Verification)</p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
                <code className="flex-1 w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-input border border-border rounded text-foreground font-mono text-xs break-all">
                  _wl.your-domain.com TXT verification_token_here
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Domains List */}
      <div
        className="bg-card border border-border rounded-lg p-4 sm:p-6 animate-fade-in-up"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <h2 className="text-base sm:text-lg font-semibold text-card-foreground">
            {whiteLabels.length > 0 ? "Configured Domains" : "No Domains Yet"}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : whiteLabels.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">No white-label domains configured yet</p>
            <button
              onClick={() => setIsCreateDialogOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Request Your First Domain
            </button>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {whiteLabels.map((config, index) => (
              <div
                key={config.configId || config.id}
                style={{
                  animation: `fadeInUp 0.4s ease-out ${0.2 + index * 0.1}s both`,
                }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 p-3 sm:p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-all duration-200 group"
              >
                <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0 mt-0.5 sm:mt-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-foreground break-all">{config.domain}</p>
                    <p className="text-xs text-muted-foreground">
                      {config.brandName} • {getTeamName(config.teamId)} •{" "}
                      {config.createdAt ? new Date(config.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:gap-3 w-full sm:w-auto">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap ${
                      config.status === "active"
                        ? "bg-green-500/20 text-green-400"
                        : config.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {config.status}
                  </span>
                  <button
                    onClick={() => handleDeleteWhiteLabel(config.configId || config.id, config.domain)}
                    className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80 transition-all p-1 flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {(success || error) && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg animate-fade-in-up ${
            success ? "bg-green-500/20 border border-green-500/20 text-green-400" : "bg-red-500/20 border border-red-500/20 text-red-400"
          }`}
        >
          {success || error}
        </div>
      )}

      {/* Create White-Label Dialog */}
      <Dialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false)
          setError("")
        }}
        title="Request New White-Label Domain"
        description="Configure a custom domain for a team"
      >
        <form onSubmit={handleCreateWhiteLabel} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Team *</label>
            <select
              value={formData.teamId}
              onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
              required
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a team</option>
              {teams.map((team) => (
                <option key={team.teamId || team.id} value={team.teamId || team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">Team that will own this domain</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Domain *</label>
            <input
              type="text"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              placeholder="app.yourcompany.com"
              required
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">Custom domain hostname</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Brand Name *</label>
            <input
              type="text"
              value={formData.brandName}
              onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              placeholder="Your Company"
              required
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">Brand name to display</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Logo URL</label>
            <input
              type="url"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">Optional logo image URL</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Primary Color</label>
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                className="w-full h-10 px-1 py-1 bg-input border border-border rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Secondary Color</label>
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                className="w-full h-10 px-1 py-1 bg-input border border-border rounded-lg cursor-pointer"
              />
            </div>
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
              {isSubmitting ? "Creating..." : "Request Domain"}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
