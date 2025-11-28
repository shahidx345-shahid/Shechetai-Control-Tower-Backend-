/**
 * Complete Example: Payment, Email, and File Upload Integration
 * This component demonstrates how to use all three new features
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useFileUpload, formatFileSize } from '@/lib/upload/upload-client'
import { getStripe } from '@/lib/stripe/stripe-client'

export function CompleteIntegrationExample() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // ========================================================================
  // STRIPE PAYMENT EXAMPLE
  // ========================================================================
  const [cardholderName, setCardholderName] = useState('')
  const [amount, setAmount] = useState(99.00)

  const handlePayment = async () => {
    try {
      setLoading(true)

      // Step 1: Create payment intent on server
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          currency: 'usd',
          customerName: cardholderName,
        }),
      })

      const { clientSecret } = await response.json()

      // Step 2: Confirm payment with Stripe
      const stripe = await getStripe()
      if (!stripe) throw new Error('Stripe not loaded')

      // Note: In production, use Stripe Elements (CardElement) for actual card input
      // This is a simplified example - you'll need to collect card details properly
      toast({
        title: 'ℹ️ Demo Mode',
        description: 'In production, integrate Stripe Elements for card collection',
      })

      // Example with actual card element (implement in production)
      // const cardElement = elements.getElement(CardElement)
      // const result = await stripe.confirmCardPayment(clientSecret, {
      //   payment_method: { card: cardElement }
      // })
      
      // Simulated success for demo
      // In production, check result.error properly

      toast({
        title: '✅ Payment Successful',
        description: `Payment of $${amount} processed successfully!`,
      })

      // Payment intent will trigger webhook → database update → receipt email
    } catch (error) {
      toast({
        title: '❌ Payment Failed',
        description: error instanceof Error ? error.message : 'Payment failed',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // ========================================================================
  // SUBSCRIPTION EXAMPLE
  // ========================================================================
  const [selectedPlan, setSelectedPlan] = useState('pro')

  const plans = [
    { id: 'basic', name: 'Basic', price: 29, priceId: 'price_basic' },
    { id: 'pro', name: 'Pro', price: 99, priceId: 'price_pro' },
    { id: 'enterprise', name: 'Enterprise', price: 299, priceId: 'price_enterprise' },
  ]

  const handleSubscribe = async (priceId: string, planName: string) => {
    try {
      setLoading(true)

      // Create subscription on server
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, planName }),
      })

      const { subscriptionId, clientSecret } = await response.json()

      // Confirm subscription payment
      const stripe = await getStripe()
      if (!stripe) throw new Error('Stripe not loaded')

      // Redirect to Stripe Checkout or use confirmCardPayment
      toast({
        title: '✅ Subscription Created',
        description: `Subscribed to ${planName} plan!`,
      })

      // Webhook will trigger → subscription activation email
    } catch (error) {
      toast({
        title: '❌ Subscription Failed',
        description: error instanceof Error ? error.message : 'Failed to create subscription',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // ========================================================================
  // EMAIL NOTIFICATION EXAMPLE
  // ========================================================================
  const [emailRecipient, setEmailRecipient] = useState('')
  const [emailType, setEmailType] = useState<'welcome' | 'invite' | 'receipt'>('welcome')

  const handleSendEmail = async () => {
    try {
      setLoading(true)

      // Send email via API
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailRecipient,
          type: emailType,
          data: {
            name: cardholderName || 'User',
            teamName: 'Acme Corporation',
            inviterName: 'Admin',
            amount: 99.00,
          },
        }),
      })

      if (!response.ok) throw new Error('Failed to send email')

      toast({
        title: '📧 Email Sent',
        description: `${emailType} email sent to ${emailRecipient}`,
      })
    } catch (error) {
      toast({
        title: '❌ Email Failed',
        description: error instanceof Error ? error.message : 'Failed to send email',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // ========================================================================
  // FILE UPLOAD EXAMPLE
  // ========================================================================
  const {
    uploadFiles,
    removeFile,
    clearFiles,
    uploading,
    progress,
    error: uploadError,
    uploadedFiles,
  } = useFileUpload({
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'],
    folder: 'documents',
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    try {
      await uploadFiles(files)
      toast({
        title: '✅ Upload Successful',
        description: `Uploaded ${files.length} file(s)`,
      })
    } catch (error) {
      toast({
        title: '❌ Upload Failed',
        description: error instanceof Error ? error.message : 'Upload failed',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Complete Integration Example</h1>
        <p className="text-muted-foreground">
          Demonstration of Stripe Payments, Email Service, and File Uploads
        </p>
      </div>

      {/* ========================================================================
          PAYMENT SECTION
          ======================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle>💳 Stripe Payment Example</CardTitle>
          <CardDescription>Process a one-time payment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="cardholder">Cardholder Name</Label>
              <Input
                id="cardholder"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                placeholder="99.00"
              />
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="font-semibold">Test Card Numbers:</p>
            <ul className="list-disc list-inside">
              <li>Success: 4242 4242 4242 4242</li>
              <li>Decline: 4000 0000 0000 0002</li>
              <li>Authentication: 4000 0025 0000 3155</li>
            </ul>
          </div>

          <Button onClick={handlePayment} disabled={loading || !cardholderName}>
            {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
          </Button>
        </CardContent>
      </Card>

      {/* ========================================================================
          SUBSCRIPTION SECTION
          ======================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle>📅 Subscription Example</CardTitle>
          <CardDescription>Create a recurring subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className={selectedPlan === plan.id ? 'border-primary' : ''}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold">${plan.price}</span>/month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    variant={selectedPlan === plan.id ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedPlan(plan.id)
                      handleSubscribe(plan.priceId, plan.name)
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Subscribe'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================
          EMAIL SECTION
          ======================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle>📧 Email Notification Example</CardTitle>
          <CardDescription>Send transactional emails</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="email">Recipient Email</Label>
              <Input
                id="email"
                type="email"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <Label htmlFor="emailType">Email Type</Label>
              <select
                id="emailType"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={emailType}
                onChange={(e) => setEmailType(e.target.value as any)}
              >
                <option value="welcome">Welcome Email</option>
                <option value="invite">Team Invitation</option>
                <option value="receipt">Payment Receipt</option>
              </select>
            </div>
          </div>

          <Button onClick={handleSendEmail} disabled={loading || !emailRecipient}>
            {loading ? 'Sending...' : 'Send Email'}
          </Button>
        </CardContent>
      </Card>

      {/* ========================================================================
          FILE UPLOAD SECTION
          ======================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle>📎 File Upload Example</CardTitle>
          <CardDescription>Upload images and documents (max 5MB)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="file">Select Files</Label>
            <Input
              id="file"
              type="file"
              multiple
              accept="image/png,image/jpeg,image/jpg,application/pdf"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            {uploading && (
              <div className="mt-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">{progress.toFixed(0)}% uploaded</p>
              </div>
            )}
            {uploadError && (
              <p className="text-sm text-destructive mt-2">{uploadError}</p>
            )}
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Uploaded Files ({uploadedFiles.length})</Label>
                <Button size="sm" variant="outline" onClick={clearFiles}>
                  Clear All
                </Button>
              </div>
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.key}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">📄</div>
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)} • {file.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFile(file.key)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
