"use client"

import { CreditCard, Plus, Loader2, Trash2, Star } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api/client"
import { Dialog } from "@/components/ui/dialog-simple"

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    interval: "monthly",
    features: [] as string[],
    active: true,
  })
  const [featureInput, setFeatureInput] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [plansRes, subsRes] = await Promise.all([
        apiClient.getSubscriptionPlans(),
        apiClient.getSubscriptions(),
      ])

      if (plansRes.success) {
        const planData = plansRes.data?.data || plansRes.data || []
        setPlans(Array.isArray(planData) ? planData : [])
      }

      if (subsRes.success) {
        const subData = subsRes.data?.data || subsRes.data || []
        setSubscriptions(Array.isArray(subData) ? subData : [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsSubmitting(true)

    try {
      const response = await apiClient.createSubscriptionPlan({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        interval: formData.interval,
        features: formData.features,
        active: formData.active,
      })

      if (response.success) {
        setSuccess("Plan created successfully!")
        setFormData({
          name: "",
          description: "",
          price: "",
          interval: "monthly",
          features: [],
          active: true,
        })
        setIsCreatePlanOpen(false)
        await fetchData()
      }
    } catch (error: any) {
      setError(error.message || "Failed to create plan")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm("Are you sure you want to cancel this subscription?")) return

    try {
      await apiClient.cancelSubscription(subscriptionId)
      setSuccess("Subscription cancelled successfully!")
      await fetchData()
    } catch (error: any) {
      setError(error.message || "Failed to cancel subscription")
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return

    try {
      await apiClient.deleteSubscriptionPlan(planId)
      setSuccess("Plan deleted successfully!")
      await fetchData()
    } catch (error: any) {
      setError(error.message || "Failed to delete plan")
    }
  }

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()],
      })
      setFeatureInput("")
    }
  }

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Subscriptions</h1>
          </div>
          <p className="text-muted-foreground">
            Manage subscription plans and active subscriptions
          </p>
        </div>
        <button
          onClick={() => setIsCreatePlanOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Plan
        </button>
      </div>

      {/* Subscription Plans */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Subscription Plans</h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <CreditCard className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">No plans found</p>
            <button
              onClick={() => setIsCreatePlanOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Your First Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.planId || plan.id}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  </div>
                  {plan.active && (
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  )}
                </div>

                <div className="mb-4">
                  <div className="text-3xl font-bold text-primary">
                    ${plan.price}
                    <span className="text-sm text-muted-foreground font-normal">
                      /{plan.interval}
                    </span>
                  </div>
                </div>

                {plan.features && plan.features.length > 0 && (
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex gap-2 pt-4 border-t border-border">
                  <button
                    onClick={() => handleDeletePlan(plan.planId || plan.id)}
                    className="flex-1 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 inline mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Subscriptions */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Active Subscriptions</h2>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No active subscriptions</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Plan</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Started</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Next Billing</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {subscriptions.map((sub) => (
                    <tr key={sub.subscriptionId || sub.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-foreground font-medium">
                        {sub.userId || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {sub.planName || sub.planId || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          sub.status === "active" ? "bg-green-500/20 text-green-400" :
                          sub.status === "cancelled" ? "bg-red-500/20 text-red-400" :
                          "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {sub.startDate ? new Date(sub.startDate).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {sub.status === "active" && (
                          <button
                            onClick={() => handleCancelSubscription(sub.subscriptionId || sub.id)}
                            className="px-3 py-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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

      {/* Create Plan Dialog */}
      <Dialog
        isOpen={isCreatePlanOpen}
        onClose={() => {
          setIsCreatePlanOpen(false)
          setError("")
        }}
        title="Create Subscription Plan"
        description="Add a new subscription plan"
      >
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Plan Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Pro Plan"
              required
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Plan description..."
              rows={3}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Price *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="29.99"
                required
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Interval *</label>
              <select
                value={formData.interval}
                onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Features</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                placeholder="Add a feature..."
                className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={addFeature}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Add
              </button>
            </div>
            {formData.features.length > 0 && (
              <ul className="space-y-2">
                {formData.features.map((feature, index) => (
                  <li key={index} className="flex items-center justify-between bg-muted rounded px-3 py-2">
                    <span className="text-sm text-foreground">{feature}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="active" className="text-sm text-foreground">Active</label>
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
                setIsCreatePlanOpen(false)
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
              {isSubmitting ? "Creating..." : "Create Plan"}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
