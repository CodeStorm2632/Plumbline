import * as React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Semantic color. */
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** Fill style. `soft` = tinted background (default), `solid` = filled, `outline` = bordered. */
  appearance?: 'soft' | 'solid' | 'outline'
  /** Show a leading status dot. */
  dot?: boolean
  children?: React.ReactNode
}

/**
 * Colored status label — 启用/停用, 成功/失败, log levels, counts. Semantic tone + soft/solid/outline.
 * @dsComponent
 * @startingPoint section="Data Display" subtitle="Status labels & tones" viewport="700x150"
 */
export function Badge(props: BadgeProps): JSX.Element
