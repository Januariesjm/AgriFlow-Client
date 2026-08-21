"use client"

import { useEffect } from "react"
import { logger } from "@/lib/logger"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error("GlobalErrorBoundary", "Unhandled client rendering exception caught", error, {
      digest: error.digest,
    })
  }, [error])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="glass max-w-md w-full p-8 rounded-xl border border-destructive/30 space-y-6 text-center">
        <div className="h-14 w-14 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto text-destructive">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Something went wrong</h2>
          <p className="text-xs text-muted-foreground">
            An unexpected error occurred while rendering this view. Our team has been notified via automated telemetry.
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  )
}
