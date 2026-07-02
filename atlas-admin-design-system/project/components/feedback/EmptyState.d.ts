import * as React from 'react'

export interface EmptyStateProps {
  title?: React.ReactNode
  description?: React.ReactNode
  /** Custom icon; defaults to an empty-box glyph. */
  icon?: React.ReactNode
  /** Optional call-to-action, e.g. a Button. */
  action?: React.ReactNode
}

/**
 * No-data / no-results placeholder for empty tables and filtered views.
 * @dsComponent
 */
export function EmptyState(props: EmptyStateProps): JSX.Element
