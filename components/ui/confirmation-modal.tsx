/**
 * Confirmation Modal Component
 * Accessible replacement for browser confirm() dialogs
 */

"use client"

import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react"
import { Dialog } from "./dialog-simple"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning" | "info" | "success"
  isLoading?: boolean
}

const variantStyles = {
  danger: {
    icon: XCircle,
    iconColor: "text-destructive",
    confirmClass: "bg-destructive hover:bg-destructive/90",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-orange-500",
    confirmClass: "bg-orange-500 hover:bg-orange-600",
  },
  info: {
    icon: Info,
    iconColor: "text-blue-500",
    confirmClass: "bg-blue-500 hover:bg-blue-600",
  },
  success: {
    icon: CheckCircle,
    iconColor: "text-green-500",
    confirmClass: "bg-green-500 hover:bg-green-600",
  },
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
  isLoading = false,
}: ConfirmationModalProps) {
  const style = variantStyles[variant]
  const Icon = style.icon

  const handleConfirm = () => {
    onConfirm()
    if (!isLoading) {
      onClose()
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Icon className={`w-6 h-6 flex-shrink-0 mt-0.5 ${style.iconColor}`} />
          <p className="text-sm text-foreground/80 flex-1">{message}</p>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${style.confirmClass}`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Dialog>
  )
}

/**
 * Hook for managing confirmation modal state
 */
import { useState } from "react"

export function useConfirmation() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<{
    title: string
    message: string
    onConfirm: () => void
    variant?: "danger" | "warning" | "info" | "success"
    confirmText?: string
    cancelText?: string
  } | null>(null)

  const confirm = (options: {
    title: string
    message: string
    onConfirm: () => void
    variant?: "danger" | "warning" | "info" | "success"
    confirmText?: string
    cancelText?: string
  }) => {
    setConfig(options)
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(() => setConfig(null), 200) // Clear after animation
  }

  const handleConfirm = () => {
    config?.onConfirm()
    handleClose()
  }

  return {
    confirm,
    ConfirmationDialog: config ? (
      <ConfirmationModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={config.title}
        message={config.message}
        variant={config.variant}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
      />
    ) : null,
  }
}
