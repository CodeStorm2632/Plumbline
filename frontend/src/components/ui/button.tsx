import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium select-none transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none rounded-md border border-transparent",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-[var(--primary-hover)] shadow-[var(--shadow-xs)]",
        secondary:
          "bg-secondary text-secondary-foreground border-border hover:bg-accent",
        outline:
          "bg-card text-foreground border-[var(--border-strong)] shadow-[var(--shadow-xs)] hover:bg-accent",
        ghost: "text-foreground hover:bg-accent",
        destructive:
          "bg-destructive text-white shadow-[var(--shadow-xs)] hover:bg-[oklch(0.52_0.22_27.3)]",
        link: "text-primary hover:underline underline-offset-3 border-none h-auto px-0",
      },
      size: {
        sm: "h-[var(--control-h-sm)] px-2.5 text-[var(--text-xs)]",
        md: "h-[var(--control-h-md)] px-3.5 text-[var(--text-sm)]",
        lg: "h-[var(--control-h-lg)] px-5 text-[var(--text-base)]",
        icon: "h-[var(--control-h-md)] w-[var(--control-h-md)] p-0",
        "icon-sm": "h-[var(--control-h-sm)] w-[var(--control-h-sm)] p-0",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
