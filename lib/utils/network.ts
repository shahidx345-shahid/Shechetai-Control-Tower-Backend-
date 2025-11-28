/**
 * Network Utilities
 * Retry logic and offline detection
 */

"use client"

import { useState, useEffect } from "react"

/**
 * Check if online
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return isOnline
}

/**
 * Retry failed requests with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on client errors (4xx)
      if (error instanceof Response && error.status >= 400 && error.status < 500) {
        throw error
      }

      // Don't retry if max attempts reached
      if (attempt === maxRetries) {
        break
      }

      // Wait with exponential backoff
      const delay = delayMs * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * Fetch with retry
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  maxRetries: number = 3
): Promise<Response> {
  return retryWithBackoff(
    async () => {
      const response = await fetch(url, options)
      
      // Retry on 5xx errors
      if (response.status >= 500) {
        throw new Error(`Server error: ${response.status}`)
      }
      
      return response
    },
    maxRetries
  )
}

/**
 * Check network connectivity
 */
export async function checkConnectivity(): Promise<boolean> {
  try {
    const response = await fetch("/api/health", {
      method: "HEAD",
      cache: "no-cache",
    })
    return response.ok
  } catch {
    return false
  }
}
