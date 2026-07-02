import { cn } from "../../lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
}

export function Skeleton({ className, lines = 4, ...props }: SkeletonProps) {
  return (
    <div className={cn("space-y-2 p-4", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="rounded animate-pulse bg-muted"
          style={{ height: "var(--row-h)", opacity: 1 - i * 0.15 }}
        />
      ))}
    </div>
  );
}
