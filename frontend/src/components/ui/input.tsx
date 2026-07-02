import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leading, trailing, disabled, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 w-full bg-card border rounded-md shadow-[var(--shadow-xs)] transition-[border-color,box-shadow]",
          "h-[var(--control-h-md)] px-2.5",
          disabled && "opacity-55 pointer-events-none bg-muted",
          className
        )}
        style={{
          borderColor: focused ? "var(--ring)" : "var(--border-strong)",
          boxShadow: focused
            ? "0 0 0 3px color-mix(in oklch, var(--ring) 30%, transparent)"
            : "var(--shadow-xs)",
          fontFamily: "var(--font-sans)",
        }}
      >
        {leading && (
          <span className="inline-flex text-muted-foreground flex-shrink-0">
            {leading}
          </span>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className="flex-1 min-w-0 border-none outline-none bg-transparent text-foreground"
          style={{ fontSize: "var(--text-sm)", fontFamily: "inherit" }}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {trailing && (
          <span className="inline-flex text-muted-foreground flex-shrink-0">
            {trailing}
          </span>
        )}
      </span>
    );
  }
);
Input.displayName = "Input";

export { Input };
