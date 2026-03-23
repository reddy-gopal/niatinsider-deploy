import { cn } from "@/lib/utils"

const SPINNER_COLOR = "var(--niat-maroon, #991b1b)"

interface SpinnerProps extends React.ComponentProps<"div"> {
  /** Size: sm (inline/buttons), default (medium), lg (page-level) */
  size?: "sm" | "default" | "lg"
}

function Spinner({ className, size = "default", ...props }: SpinnerProps) {
  const sizeClass =
    size === "sm" ? "size-4" : size === "lg" ? "size-10" : "size-6"
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("animate-spin rounded-full border-2 border-[#fbf2f3]", sizeClass, className)}
      style={{ borderTopColor: SPINNER_COLOR }}
      {...props}
    />
  )
}

/** Centered full-page or block-level loading state with spinner (no text) */
function LoadingScreen({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <Spinner size="lg" />
    </div>
  )
}

export { Spinner, LoadingScreen }
