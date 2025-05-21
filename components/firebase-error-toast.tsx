"use client"

import type { FirebaseError } from "@/lib/firebase-error-handler"
import { AlertCircle, AlertTriangle, Info, XCircle } from "lucide-react"
import { Toast, ToastClose, ToastDescription, ToastTitle } from "@/components/ui/toast"

interface FirebaseErrorToastProps {
  error: FirebaseError
  onClose?: () => void
}

export function FirebaseErrorToast({ error, onClose }: FirebaseErrorToastProps) {
  // Determine icon based on severity
  const Icon =
    error.severity === "critical"
      ? XCircle
      : error.severity === "error"
        ? AlertCircle
        : error.severity === "warning"
          ? AlertTriangle
          : Info

  // Determine background color based on severity
  const bgColor =
    error.severity === "critical"
      ? "bg-red-100 border-red-400"
      : error.severity === "error"
        ? "bg-red-50 border-red-200"
        : error.severity === "warning"
          ? "bg-yellow-50 border-yellow-200"
          : "bg-blue-50 border-blue-200"

  // Determine text color based on severity
  const textColor =
    error.severity === "critical"
      ? "text-red-800"
      : error.severity === "error"
        ? "text-red-600"
        : error.severity === "warning"
          ? "text-yellow-700"
          : "text-blue-700"

  return (
    <Toast className={`${bgColor} ${textColor}`}>
      <div className="flex items-start gap-2">
        <Icon className="h-5 w-5" />
        <div className="grid gap-1">
          <ToastTitle className="font-medium">
            {error.severity === "critical"
              ? "Critical Error"
              : error.severity === "error"
                ? "Error"
                : error.severity === "warning"
                  ? "Warning"
                  : "Information"}
          </ToastTitle>
          <ToastDescription className="text-sm">{error.userMessage}</ToastDescription>
          {process.env.NODE_ENV !== "production" && (
            <div className="mt-2 text-xs opacity-80 font-mono">Code: {error.code}</div>
          )}
        </div>
      </div>
      <ToastClose onClick={onClose} />
    </Toast>
  )
}
