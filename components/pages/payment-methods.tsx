"use client"

import { CreditCard as CardIcon, Plus, Loader2, Trash2, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api/client"
import { Dialog } from "@/components/ui/dialog-simple"

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    type: "card",
    cardNumber: "",
    cardHolderName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    isDefault: false,
  })

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const fetchPaymentMethods = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getPaymentMethods()
      if (response.success) {
        const data = response.data?.data || response.data || []
        setPaymentMethods(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsSubmitting(true)

    try {
      const response = await apiClient.addPaymentMethod({
        type: formData.type,
        cardNumber: formData.cardNumber.replace(/\s/g, ""),
        cardHolderName: formData.cardHolderName,
        expiryMonth: formData.expiryMonth,
        expiryYear: formData.expiryYear,
        cvv: formData.cvv,
        isDefault: formData.isDefault,
      })

      if (response.success) {
        setSuccess("Payment method added successfully!")
        setFormData({
          type: "card",
          cardNumber: "",
          cardHolderName: "",
          expiryMonth: "",
          expiryYear: "",
          cvv: "",
          isDefault: false,
        })
        setIsAddDialogOpen(false)
        await fetchPaymentMethods()
      }
    } catch (error: any) {
      setError(error.message || "Failed to add payment method")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePaymentMethod = async (methodId: string) => {
    if (!confirm("Are you sure you want to delete this payment method?")) return

    try {
      await apiClient.deletePaymentMethod(methodId)
      setSuccess("Payment method deleted successfully!")
      await fetchPaymentMethods()
    } catch (error: any) {
      setError(error.message || "Failed to delete payment method")
    }
  }

  const handleSetDefault = async (methodId: string) => {
    try {
      await apiClient.setDefaultPaymentMethod(methodId)
      setSuccess("Default payment method updated!")
      await fetchPaymentMethods()
    } catch (error: any) {
      setError(error.message || "Failed to set default payment method")
    }
  }

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "")
    const chunks = cleaned.match(/.{1,4}/g)
    return chunks ? chunks.join(" ") : cleaned
  }

  const maskCardNumber = (cardNumber: string) => {
    const last4 = cardNumber.slice(-4)
    return `•••• •••• •••• ${last4}`
  }

  const getCardBrand = (cardNumber: string) => {
    const cleaned = cardNumber.replace(/\s/g, "")
    if (cleaned.startsWith("4")) return "Visa"
    if (cleaned.startsWith("5")) return "Mastercard"
    if (cleaned.startsWith("3")) return "Amex"
    return "Card"
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <CardIcon className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Payment Methods</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your payment methods and billing information
          </p>
        </div>
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Payment Method
        </button>
      </div>

      {/* Payment Methods Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : paymentMethods.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <CardIcon className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-4">No payment methods found</p>
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Your First Payment Method
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paymentMethods.map((method) => (
            <div
              key={method.paymentMethodId || method.id}
              className="bg-gradient-to-br from-card to-muted/30 border border-border rounded-xl p-6 hover:shadow-lg transition-all relative"
            >
              {method.isDefault && (
                <div className="absolute top-4 right-4">
                  <span className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs font-semibold">
                    <Check className="w-3 h-3" />
                    Default
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className="text-sm text-muted-foreground mb-2">
                  {getCardBrand(method.cardNumber || method.last4 || "")}
                </div>
                <div className="text-xl font-mono text-foreground tracking-wider">
                  {method.cardNumber
                    ? maskCardNumber(method.cardNumber)
                    : method.last4
                    ? `•••• •••• •••• ${method.last4}`
                    : "•••• •••• •••• ••••"}
                </div>
              </div>

              <div className="flex justify-between items-end mb-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Card Holder</div>
                  <div className="text-sm font-medium text-foreground">
                    {method.cardHolderName || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Expires</div>
                  <div className="text-sm font-medium text-foreground">
                    {method.expiryMonth && method.expiryYear
                      ? `${method.expiryMonth}/${method.expiryYear}`
                      : "N/A"}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-border">
                {!method.isDefault && (
                  <button
                    onClick={() => handleSetDefault(method.paymentMethodId || method.id)}
                    className="flex-1 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleDeletePaymentMethod(method.paymentMethodId || method.id)}
                  className="flex-1 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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

      {/* Add Payment Method Dialog */}
      <Dialog
        isOpen={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false)
          setError("")
        }}
        title="Add Payment Method"
        description="Add a new card for payments"
      >
        <form onSubmit={handleAddPaymentMethod} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Card Number *</label>
            <input
              type="text"
              value={formData.cardNumber}
              onChange={(e) => {
                const formatted = formatCardNumber(e.target.value)
                if (formatted.replace(/\s/g, "").length <= 16) {
                  setFormData({ ...formData, cardNumber: formatted })
                }
              }}
              placeholder="1234 5678 9012 3456"
              required
              maxLength={19}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Card Holder Name *</label>
            <input
              type="text"
              value={formData.cardHolderName}
              onChange={(e) => setFormData({ ...formData, cardHolderName: e.target.value })}
              placeholder="John Doe"
              required
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Month *</label>
              <input
                type="text"
                value={formData.expiryMonth}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "")
                  if (value.length <= 2 && (value === "" || (parseInt(value) >= 1 && parseInt(value) <= 12))) {
                    setFormData({ ...formData, expiryMonth: value })
                  }
                }}
                placeholder="MM"
                required
                maxLength={2}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Year *</label>
              <input
                type="text"
                value={formData.expiryYear}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "")
                  if (value.length <= 4) {
                    setFormData({ ...formData, expiryYear: value })
                  }
                }}
                placeholder="YYYY"
                required
                maxLength={4}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">CVV *</label>
              <input
                type="text"
                value={formData.cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "")
                  if (value.length <= 4) {
                    setFormData({ ...formData, cvv: value })
                  }
                }}
                placeholder="123"
                required
                maxLength={4}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isDefault" className="text-sm text-foreground">Set as default payment method</label>
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
                setIsAddDialogOpen(false)
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
              {isSubmitting ? "Adding..." : "Add Card"}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
