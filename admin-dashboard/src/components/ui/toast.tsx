import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react"

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "destructive" | "warning"
  onClose?: () => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", onClose, children, ...props }, ref) => {
    const variantClasses = {
      default: "bg-[var(--background)] text-[var(--foreground)] border-[var(--border)]",
      success: "bg-green-50 text-green-900 border-green-300 dark:bg-green-900/30 dark:text-green-100 dark:border-green-600",
      destructive: "bg-red-50 text-red-900 border-red-300 dark:bg-red-900/30 dark:text-red-100 dark:border-red-600",
      warning: "bg-yellow-50 text-yellow-900 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-100 dark:border-yellow-600"
    }

    const variantIcons = {
      default: <Info className="h-4 w-4" />,
      success: <CheckCircle2 className="h-4 w-4" />,
      destructive: <AlertTriangle className="h-4 w-4" />,
      warning: <AlertTriangle className="h-4 w-4" />
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex items-start gap-3 rounded-lg border p-4 shadow-lg",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <div className="flex-shrink-0">
          {variantIcons[variant]}
        </div>
        <div className="flex-1">
          {children}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-black/10 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
Toast.displayName = "Toast"

export { Toast }
