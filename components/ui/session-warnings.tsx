/**
 * Session Timeout Warning Component
 */

"use client"

import { AlertTriangle, Clock } from "lucide-react"
import { Dialog } from "./dialog-simple"

interface SessionTimeoutWarningProps {
  isOpen: boolean
  timeLeft: number
  onExtend: () => void
  onLogout: () => void
}

export function SessionTimeoutWarning({
  isOpen,
  timeLeft,
  onExtend,
  onLogout,
}: SessionTimeoutWarningProps) {
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <Dialog isOpen={isOpen} onClose={onExtend} title="Session Expiring Soon">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-foreground/80 mb-3">
              Your session will expire due to inactivity. You will be automatically logged out in:
            </p>
            <div className="flex items-center gap-2 text-2xl font-bold text-orange-500">
              <Clock className="w-6 h-6" />
              <span>
                {minutes}:{seconds.toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onLogout}
            className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          >
            Logout Now
          </button>
          <button
            onClick={onExtend}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </Dialog>
  )
}

/**
 * Concurrent Session Warning Component
 */
interface ConcurrentSessionWarningProps {
  isOpen: boolean
}

export function ConcurrentSessionWarning({ isOpen }: ConcurrentSessionWarningProps) {
  return (
    <Dialog isOpen={isOpen} onClose={() => {}} title="Session Conflict Detected">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-foreground/80">
              Your account has been logged in from another location. You will be logged out shortly for
              security reasons.
            </p>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

/**
 * Offline Warning Component
 */
interface OfflineWarningProps {
  isOffline: boolean
}

export function OfflineWarning({ isOffline }: OfflineWarningProps) {
  if (!isOffline) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-orange-500 text-white rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
      <AlertTriangle className="w-5 h-5" />
      <span className="text-sm font-medium">You are currently offline</span>
    </div>
  )
}
