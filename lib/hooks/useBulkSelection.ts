/**
 * Bulk Operations Utilities
 * Multi-select and batch actions
 */

"use client"

import { useState, useCallback } from "react"

export interface UseBulkSelectionProps<T> {
  items: T[]
  getItemId: (item: T) => string
}

export function useBulkSelection<T>({ items, getItemId }: UseBulkSelectionProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const toggleItem = useCallback((item: T) => {
    const id = getItemId(item)
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [getItemId])

  const toggleAll = useCallback(() => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map(getItemId)))
    }
  }, [items, selectedIds.size, getItemId])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const isSelected = useCallback((item: T) => {
    return selectedIds.has(getItemId(item))
  }, [selectedIds, getItemId])

  const isAllSelected = items.length > 0 && selectedIds.size === items.length
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < items.length
  const selectedCount = selectedIds.size
  const selectedItems = items.filter(item => selectedIds.has(getItemId(item)))

  return {
    selectedIds,
    selectedItems,
    selectedCount,
    isSelected,
    isAllSelected,
    isSomeSelected,
    toggleItem,
    toggleAll,
    clearSelection,
  }
}

/**
 * Batch operation executor with progress tracking
 */
export async function executeBatchOperation<T>(
  items: T[],
  operation: (item: T) => Promise<void>,
  onProgress?: (completed: number, total: number) => void
): Promise<{ succeeded: T[]; failed: Array<{ item: T; error: Error }> }> {
  const succeeded: T[] = []
  const failed: Array<{ item: T; error: Error }> = []

  for (let i = 0; i < items.length; i++) {
    try {
      await operation(items[i])
      succeeded.push(items[i])
    } catch (error) {
      failed.push({ item: items[i], error: error as Error })
    }
    
    onProgress?.(i + 1, items.length)
  }

  return { succeeded, failed }
}
