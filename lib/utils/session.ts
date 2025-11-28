/**
 * Session Management Utilities
 * Handles session timeout, concurrent sessions, and force logout
 */

"use client"

import { useEffect, useRef, useState } from "react"
import { signOutUser } from "@/lib/firebase/client"
import { useRouter } from "next/navigation"

const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const WARNING_TIME = 5 * 60 * 1000 // Show warning 5 minutes before timeout
const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart", "click"]

/**
 * Session timeout hook
 */
export function useSessionTimeout(enabled: boolean = true) {
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  const clearTimers = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
  }

  const resetTimer = () => {
    clearTimers()
    setShowWarning(false)

    if (!enabled) return

    // Set warning timer
    warningRef.current = setTimeout(() => {
      setShowWarning(true)
      setTimeLeft(WARNING_TIME / 1000)
    }, SESSION_TIMEOUT - WARNING_TIME)

    // Set logout timer
    timeoutRef.current = setTimeout(async () => {
      await signOutUser()
      router.push("/login?timeout=true")
    }, SESSION_TIMEOUT)
  }

  const extendSession = () => {
    resetTimer()
  }

  useEffect(() => {
    if (!enabled) return

    resetTimer()

    // Add activity listeners
    const handleActivity = () => resetTimer()
    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, handleActivity)
    })

    // Update countdown
    const interval = setInterval(() => {
      if (showWarning) {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }
    }, 1000)

    return () => {
      clearTimers()
      clearInterval(interval)
      ACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [enabled, showWarning, router])

  return {
    showWarning,
    timeLeft,
    extendSession,
  }
}

/**
 * Concurrent session detection
 */
export function useConcurrentSession() {
  const [hasConflict, setHasConflict] = useState(false)
  const router = useRouter()
  const sessionId = useRef<string>(generateSessionId())

  useEffect(() => {
    const channel = new BroadcastChannel("auth_channel")
    
    // Register this session
    localStorage.setItem("current_session", sessionId.current)

    // Listen for other sessions
    channel.addEventListener("message", (event) => {
      if (event.data.type === "new_session" && event.data.sessionId !== sessionId.current) {
        setHasConflict(true)
        setTimeout(async () => {
          await signOutUser()
          router.push("/login?conflict=true")
        }, 3000)
      }
    })

    // Announce this session
    channel.postMessage({ type: "new_session", sessionId: sessionId.current })

    return () => {
      channel.close()
    }
  }, [router])

  return { hasConflict }
}

/**
 * Generate unique session ID
 */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Force logout from all devices
 */
export async function forceLogoutAllDevices(userId: string): Promise<void> {
  try {
    // Call API to invalidate all tokens
    await fetch("/api/users/logout-all", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })

    // Broadcast logout to all tabs
    const channel = new BroadcastChannel("auth_channel")
    channel.postMessage({ type: "force_logout", userId })
    channel.close()
  } catch (error) {
    console.error("Force logout failed:", error)
  }
}

/**
 * Get session info
 */
export function getSessionInfo() {
  return {
    sessionId: localStorage.getItem("current_session"),
    lastActivity: localStorage.getItem("last_activity"),
    loginTime: localStorage.getItem("login_time"),
  }
}

/**
 * Update last activity timestamp
 */
export function updateActivity() {
  localStorage.setItem("last_activity", Date.now().toString())
}
