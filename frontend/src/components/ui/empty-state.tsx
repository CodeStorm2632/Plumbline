import { cn } from "../../lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
}

export function EmptyState({
  message = "暂无数据",
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center py-16", className)}
      {...props}
    >
      <p
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--muted-foreground)",
          margin: 0,
        }}
      >
        {message}
      </p>
    </div>
  );
}
