"use client"

import { Activity, Mail, Terminal, Check } from "lucide-react"
import { useState } from "react"
import { getCurrentUserToken } from "@/lib/firebase/client"

export default function DebugToolsPage() {
  const [healthStatus, setHealthStatus] = useState<"idle" | "checking" | "ok" | "error">("idle")
  const [healthData, setHealthData] = useState<any>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [emailSending, setEmailSending] = useState(false)
  const [testEmail, setTestEmail] = useState("shahidx345@gmail.com")
  const [emailError, setEmailError] = useState("")
  const [apiTest, setApiTest] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [apiError, setApiError] = useState("")

  const handleHealthCheck = async () => {
    setHealthStatus("checking")
    setHealthData(null)
    try {
      const token = await getCurrentUserToken()
      const response = await fetch('/api/overview', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      
      if (response.ok) {
        const data = await response.json()
        setHealthData(data.data)
        setHealthStatus("ok")
      } else {
        setHealthStatus("error")
      }
    } catch (error) {
      setHealthStatus("error")
    }
  }

  const handleSendEmail = async () => {
    if (!testEmail) return

    setEmailSending(true)
    setEmailError("")
    
    try {
      const token = await getCurrentUserToken()
      if (!token) {
        setEmailError("Not authenticated")
        setEmailSending(false)
        return
      }

      const response = await fetch('/api/debug/email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: testEmail,
          subject: "Test Email from Control Tower",
          message: "This is a test email to verify email configuration."
        })
      })

      if (response.ok) {
        setEmailSent(true)
        setTimeout(() => {
          setEmailSent(false)
          setTestEmail("")
        }, 3000)
      } else {
        const data = await response.json()
        setEmailError(data.error || "Failed to send email")
      }
    } catch (error: any) {
      setEmailError(error.message || "Failed to send email")
    } finally {
      setEmailSending(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Debug & Tools</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Internal utilities and diagnostic tools for platform management
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Health Check */}
        <div
          className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg hover:shadow-green-500/5 transition-all duration-300 animate-fade-in-up"
          style={{ animationDelay: "0s" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity
              className={`w-4 h-4 sm:w-5 sm:h-5 ${healthStatus === "ok" ? "text-green-500 animate-pulse-glow" : "text-muted-foreground"}`}
            />
            <h3 className="font-semibold text-sm sm:text-base text-card-foreground">Health Check</h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">Run a system health diagnostic</p>
          <button
            onClick={handleHealthCheck}
            disabled={healthStatus === "checking"}
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${
              healthStatus === "checking"
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg"
            }`}
          >
            {healthStatus === "checking" ? "Checking..." : "Run Check"}
          </button>
          <p className="text-xs text-muted-foreground mt-3 font-semibold">
            Status:{" "}
            {healthStatus === "ok" ? (
              <span className="text-green-400">Healthy ✓</span>
            ) : healthStatus === "error" ? (
              <span className="text-red-400">Error ✗</span>
            ) : (
              <span className="text-muted-foreground">Idle</span>
            )}
          </p>
          {healthData && (
            <div className="mt-3 text-xs space-y-1">
              <p className="text-muted-foreground">
                Teams: <span className="text-foreground font-semibold">{healthData.totalTeams || 0}</span>
              </p>
              <p className="text-muted-foreground">
                Agents: <span className="text-foreground font-semibold">{healthData.totalAgents || 0}</span>
              </p>
            </div>
          )}
        </div>

        {/* Send Test Email */}
        <div
          className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Mail className={`w-4 h-4 sm:w-5 sm:h-5 ${emailSent ? "text-green-500" : "text-primary"}`} />
            <h3 className="font-semibold text-sm sm:text-base text-card-foreground">Test Email</h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">Send a test SMTP email</p>
          <div className="space-y-2">
            <input
              type="email"
              placeholder="recipient@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              disabled={emailSending || emailSent}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {emailError && (
              <p className="text-xs text-red-400">{emailError}</p>
            )}
            <button
              onClick={handleSendEmail}
              disabled={emailSending || emailSent || !testEmail}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                emailSent
                  ? "bg-green-500/20 text-green-400"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg"
              }`}
            >
              {emailSending ? "Sending..." : emailSent ? "Sent ✓" : "Send"}
            </button>
          </div>
        </div>

        {/* API Info */}
        <div
          className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            <h3 className="font-semibold text-sm sm:text-base text-card-foreground">API Base</h3>
          </div>
          <code className="block text-xs font-mono text-foreground bg-input p-2.5 sm:p-3 rounded break-all border border-border">
            https://hooks.shechet.com
          </code>
          <p className="text-xs text-muted-foreground mt-3 font-semibold">
            Namespace: <code className="text-foreground">/_config</code>
          </p>
        </div>
      </div>

      {/* Auth Debug (Development Only) */}
      <div
        className="bg-card border border-border rounded-lg p-4 sm:p-6 animate-fade-in-up"
        style={{ animationDelay: "0.3s" }}
      >
        <div className="flex items-center justify-between mb-4 flex-col sm:flex-row gap-2 sm:gap-0">
          <h2 className="text-base sm:text-lg font-semibold text-card-foreground">Auth Debug (Dev Only)</h2>
          <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full font-semibold">
            Non-Prod
          </span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mb-4">
          These utilities are for local development only and disabled in production
        </p>
        <div className="space-y-2">
          {[
            { label: "Echo Authorization Header", icon: Check },
            { label: "Verify ID Token", icon: Check },
            { label: "Show Signer Fingerprint", icon: Check },
          ].map((item, index) => (
            <button
              key={item.label}
              style={{
                animation: `fadeInUp 0.4s ease-out ${0.3 + index * 0.08}s both`,
              }}
              className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 bg-muted/30 border border-border rounded-lg text-xs sm:text-sm text-foreground hover:bg-muted/50 hover:border-primary/50 transition-all duration-200 flex items-center justify-between group"
            >
              <span className="font-medium">{item.label}</span>
              <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
