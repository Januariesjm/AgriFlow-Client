import { CheckCircle2, AlertCircle } from "lucide-react"

interface StatusBannerProps {
  variant: "success" | "error"
  message: string
  withIcon?: boolean
  className?: string
}

/**
 * Shared feedback banner for form submission and mutation outcomes across
 * dashboard pages. Renders nothing when the message is empty so callers can
 * bind it directly to their success/error state.
 */
export default function StatusBanner({ variant, message, withIcon = false, className = "" }: StatusBannerProps) {
  if (!message) return null

  const palette =
    variant === "success"
      ? "bg-green-500/10 border-green-500/30 text-green-400"
      : "bg-destructive/10 border-destructive/30 text-destructive"

  const Icon = variant === "success" ? CheckCircle2 : AlertCircle

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`${palette} border text-sm px-4 py-3 rounded-lg ${withIcon ? "flex items-center space-x-2" : ""} ${className}`.trim()}
    >
      {withIcon && <Icon className="h-5 w-5 shrink-0" />}
      <span>{message}</span>
    </div>
  )
}
