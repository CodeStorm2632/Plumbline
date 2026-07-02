import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/40", className)}
    {...props}
  />
));
SheetOverlay.displayName = "SheetOverlay";

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    title: string;
    description?: string;
  }
>(({ className, children, title, description, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn("fixed right-0 top-0 bottom-0 z-50 flex flex-col outline-none", className)}
      style={{
        width: "min(520px, 100vw)",
        background: "var(--card)",
        borderLeft: "1px solid var(--border)",
        boxShadow: "var(--shadow-lg)",
      }}
      {...props}
    >
      {/* Accessible title — always present, visually shown in header */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{
          padding: "0 20px",
          height: "var(--header-h)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <DialogPrimitive.Title
          style={{
            margin: 0,
            fontSize: "var(--text-lg)",
            fontWeight: "var(--font-semibold)",
            color: "var(--foreground)",
          }}
        >
          {title}
        </DialogPrimitive.Title>
        <DialogPrimitive.Close className="text-muted-foreground hover:text-foreground transition-colors">
          <X size={16} />
          <span className="sr-only">关闭</span>
        </DialogPrimitive.Close>
      </div>
      {description && (
        <DialogPrimitive.Description className="sr-only">
          {description}
        </DialogPrimitive.Description>
      )}
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = "SheetContent";

const SheetBody = ({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex-1 overflow-y-auto", className)}
    style={{ padding: "16px 20px", ...style }}
    {...props}
  />
);

const SheetFooter = ({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex items-center gap-2 flex-shrink-0", className)}
    style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", ...style }}
    {...props}
  />
);

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetBody, SheetFooter };
