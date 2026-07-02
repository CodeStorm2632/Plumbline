import * as React from "react";
import { cn } from "../../lib/utils";

export interface NativeSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

/** Styled native <select> — used where a full Radix Select is unnecessary. */
const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, disabled, ...props }, ref) => (
    <select
      ref={ref}
      disabled={disabled}
      className={cn(
        "w-full appearance-none bg-card text-foreground rounded-md",
        "border border-[var(--border-strong)] shadow-[var(--shadow-xs)]",
        "focus:outline-none focus:border-ring",
        "disabled:opacity-55 disabled:bg-muted",
        className
      )}
      style={{
        height: "var(--control-h-md)",
        padding: "0 32px 0 10px",
        fontSize: "var(--text-sm)",
        fontFamily: "var(--font-sans)",
        backgroundImage:
          `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 10px center",
      }}
      {...props}
    />
  )
);
NativeSelect.displayName = "NativeSelect";

export { NativeSelect };
