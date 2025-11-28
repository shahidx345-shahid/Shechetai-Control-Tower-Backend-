"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { TopBar } from "@/components/layout/top-bar"
import { Sidebar } from "@/components/layout/sidebar"
import { useSessionTimeout, useConcurrentSession } from "@/lib/utils/session"
import { useOnlineStatus } from "@/lib/utils/network"
import { SessionTimeoutWarning, ConcurrentSessionWarning, OfflineWarning } from "@/components/ui/session-warnings"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState("admin@shechetai.com")
  const [isSuperAdmin, setIsSuperAdmin] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Session management
  const { showWarning, timeLeft, extendSession } = useSessionTimeout(true)
  const { hasConflict } = useConcurrentSession()
  const isOffline = useOnlineStatus()

  // Get current section from pathname
  const currentSection = pathname?.split('/')[2] || 'overview'

  useEffect(() => {
    // Check if user is authenticated
    const { onAuthChange } = require("@/lib/firebase/client")
    
    const unsubscribe = onAuthChange((user: any) => {
      if (!user) {
        router.push("/login")
        return
      }
      
      setUserEmail(user.email || "admin@shechetai.com")
      setIsSuperAdmin(true)
      setLoading(false)
    })
    
    return () => unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    const { signOutUser } = require("@/lib/firebase/client")
    await signOutUser()
    router.push("/login")
  }

  const handleSectionChange = (section: string) => {
    router.push(`/dashboard/${section}`)
    setIsSidebarOpen(false)
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Session warnings */}
      <SessionTimeoutWarning
        isOpen={showWarning}
        timeLeft={timeLeft}
        onExtend={extendSession}
        onLogout={handleLogout}
      />
      <ConcurrentSessionWarning isOpen={hasConflict} />
      <OfflineWarning isOffline={!isOffline} />

      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Sidebar
          currentSection={currentSection}
          onSectionChange={handleSectionChange}
        />
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 lg:hidden z-40" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          userEmail={userEmail}
          isSuperAdmin={isSuperAdmin}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
