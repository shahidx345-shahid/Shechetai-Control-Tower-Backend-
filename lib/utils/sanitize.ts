/**
 * Input Sanitization Utilities
 * Prevents XSS attacks by sanitizing user inputs
 */

import DOMPurify from "dompurify"

/**
 * Sanitize HTML content to prevent XSS attacks
 * Use this for any user-generated content that will be rendered as HTML
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === "undefined") {
    // Server-side: just remove all HTML tags
    return dirty.replace(/<[^>]*>/g, "")
  }
  
  // Client-side: use DOMPurify
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br"],
    ALLOWED_ATTR: ["href", "title"],
  })
}

/**
 * Sanitize plain text input
 * Removes control characters and trims whitespace
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "") // Remove control characters
    .trim()
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

/**
 * Sanitize object by sanitizing all string values
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj }
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      sanitized[key] = sanitizeText(sanitized[key]) as any
    } else if (sanitized[key] && typeof sanitized[key] === "object") {
      sanitized[key] = sanitizeObject(sanitized[key])
    }
  }
  
  return sanitized
}

/**
 * Escape special characters for SQL-like queries
 */
export function escapeSqlLike(str: string): string {
  return str.replace(/[%_\\]/g, "\\$&")
}

/**
 * Remove potential SQL injection patterns
 */
export function sanitizeSqlInput(input: string): string {
  return input
    .replace(/['";\\]/g, "")
    .trim()
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    // Only allow http and https protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null
    }
    return parsed.toString()
  } catch {
    return null
  }
}

/**
 * Sanitize filename to prevent directory traversal
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace special chars
    .replace(/\.{2,}/g, ".") // Remove multiple dots
    .replace(/^\.+/, "") // Remove leading dots
    .slice(0, 255) // Limit length
}
