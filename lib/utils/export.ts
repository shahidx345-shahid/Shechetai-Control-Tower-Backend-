/**
 * Data Export Utilities
 * Export data to CSV, Excel, and other formats
 */

import Papa from "papaparse"

/**
 * Export data to CSV file
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: Array<keyof T>
): void {
  // Filter columns if specified
  const exportData = columns
    ? data.map(row => {
        const filtered: any = {}
        columns.forEach(col => {
          filtered[col] = row[col]
        })
        return filtered
      })
    : data

  // Convert to CSV
  const csv = Papa.unparse(exportData)

  // Create blob and download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export data to JSON file
 */
export function exportToJSON<T>(data: T, filename: string): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: "application/json" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.json`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Copy data to clipboard as CSV
 */
export async function copyToClipboard<T extends Record<string, any>>(
  data: T[],
  columns?: Array<keyof T>
): Promise<void> {
  const exportData = columns
    ? data.map(row => {
        const filtered: any = {}
        columns.forEach(col => {
          filtered[col] = row[col]
        })
        return filtered
      })
    : data

  const csv = Papa.unparse(exportData)
  await navigator.clipboard.writeText(csv)
}

/**
 * Format data for export (clean up values)
 */
export function formatForExport<T extends Record<string, any>>(
  data: T[],
  formatters?: Partial<Record<keyof T, (value: any) => string>>
): T[] {
  return data.map(row => {
    const formatted = { ...row }
    
    if (formatters) {
      Object.keys(formatters).forEach(key => {
        const formatter = formatters[key as keyof T]
        if (formatter && key in formatted) {
          formatted[key as keyof T] = formatter(formatted[key as keyof T]) as any
        }
      })
    }

    // Clean up common fields
    Object.keys(formatted).forEach(key => {
      const value = formatted[key as keyof T]
      
      // Format dates
      if (value && typeof value === 'object' && 'toISOString' in value) {
        formatted[key as keyof T] = (value as Date).toISOString() as any
      }
      // Convert null/undefined to empty string
      else if (value === null || value === undefined) {
        formatted[key as keyof T] = "" as any
      }
      // Stringify objects
      else if (typeof value === "object") {
        formatted[key as keyof T] = JSON.stringify(value) as any
      }
    })

    return formatted
  })
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(prefix: string, extension: string = "csv"): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5)
  return `${prefix}_${timestamp}.${extension}`
}
