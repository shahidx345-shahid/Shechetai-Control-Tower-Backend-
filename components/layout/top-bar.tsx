"use client"

import { Settings, Bell, Menu, X, LogOut } from "lucide-react"
import { signOutUser } from "@/lib/firebase/client"
import { useRouter } from "next/navigation"

interface TopBarProps {
  userEmail: string
  isSuperAdmin: boolean
  onMenuToggle?: () => void
  isSidebarOpen?: boolean
}

export function TopBar({ userEmail, isSuperAdmin, onMenuToggle, isSidebarOpen }: TopBarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOutUser()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <header className="border-accent-bottom bg-card border-b border-border h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors duration-200 cursor-pointer"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="text-base sm:text-lg font-bold text-foreground tracking-tight">Control Tower</div>
        <div className="text-xs px-2 sm:px-3 py-1 bg-primary/15 text-primary rounded-full font-semibold">PROD</div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        {/* User Info - Hidden on small screens, shown on sm and up */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-lg bg-primary/8 hover:bg-primary/12 transition-colors duration-200 border border-primary/20">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/30 flex items-center justify-center text-primary font-bold text-xs sm:text-sm">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block">
            <div className="text-foreground text-xs font-semibold leading-tight">{userEmail}</div>
            <div
              className={`text-xs font-bold tracking-wider ${isSuperAdmin ? "text-primary" : "text-muted-foreground"}`}
            >
              {isSuperAdmin ? "SUPER ADMIN" : "ADMIN"}
            </div>
          </div>
        </div>

        {/* Buttons - Icons only on mobile */}
        <button className="p-2 hover:bg-muted rounded-lg transition-colors duration-200 group cursor-pointer">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors duration-200 group cursor-pointer">
          <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
        <button 
          onClick={handleLogout}
          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors duration-200 group cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-destructive transition-colors" />
        </button>
      </div>
    </header>
  )
}
