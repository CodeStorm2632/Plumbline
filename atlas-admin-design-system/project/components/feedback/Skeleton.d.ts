export interface SkeletonProps {
  width?: string | number
  height?: string | number
  radius?: string
  /** Render as a circle (uses height as diameter) — for avatars. */
  circle?: boolean
}

/**
 * Shimmering loading placeholder for tables, cards, and profile rows.
 * @dsComponent
 */
export function Skeleton(props: SkeletonProps): JSX.Element
