import * as React from "react";

type BadgeTone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";
type BadgeAppearance = "soft" | "solid" | "outline";

interface ToneTokens {
  solidBg: string;
  softBg: string;
  softFg: string;
  line: string;
  dot: string;
  solidFg: string;
}

const tones: Record<BadgeTone, ToneTokens> = {
  neutral: {
    solidBg: "var(--muted-foreground)",
    solidFg: "#fff",
    softBg: "var(--neutral-subtle)",
    softFg: "var(--neutral-subtle-foreground)",
    line: "var(--border-strong)",
    dot: "var(--muted-foreground)",
  },
  primary: {
    solidBg: "var(--primary)",
    solidFg: "var(--primary-foreground)",
    softBg: "var(--primary-muted)",
    softFg: "var(--primary)",
    line: "var(--primary)",
    dot: "var(--primary)",
  },
  success: {
    solidBg: "var(--success)",
    solidFg: "var(--success-foreground)",
    softBg: "var(--success-subtle)",
    softFg: "var(--success-subtle-foreground)",
    line: "var(--success)",
    dot: "var(--success)",
  },
  warning: {
    solidBg: "var(--warning)",
    solidFg: "var(--warning-foreground)",
    softBg: "var(--warning-subtle)",
    softFg: "var(--warning-subtle-foreground)",
    line: "var(--warning)",
    dot: "var(--warning)",
  },
  danger: {
    solidBg: "var(--destructive)",
    solidFg: "var(--destructive-foreground)",
    softBg: "var(--destructive-subtle)",
    softFg: "var(--destructive-subtle-foreground)",
    line: "var(--destructive)",
    dot: "var(--destructive)",
  },
  info: {
    solidBg: "var(--info)",
    solidFg: "var(--info-foreground)",
    softBg: "var(--info-subtle)",
    softFg: "var(--info-subtle-foreground)",
    line: "var(--info)",
    dot: "var(--info)",
  },
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  appearance?: BadgeAppearance;
  dot?: boolean;
}

export function Badge({
  tone = "neutral",
  appearance = "soft",
  dot = false,
  children,
  style,
  ...props
}: BadgeProps) {
  const t = tones[tone];
  const look: React.CSSProperties =
    appearance === "solid"
      ? { background: t.solidBg, color: t.solidFg }
      : appearance === "outline"
      ? { background: "transparent", color: t.softFg, borderColor: t.line }
      : { background: t.softBg, color: t.softFg };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "2px 8px",
        borderRadius: "var(--radius-md)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-xs)",
        fontWeight: "var(--font-medium)",
        lineHeight: 1.4,
        whiteSpace: "nowrap",
        border: "1px solid transparent",
        ...look,
        ...style,
      }}
      {...props}
    >
      {dot && (
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "var(--radius-full)",
            background: appearance === "solid" ? "currentColor" : t.dot,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
}
