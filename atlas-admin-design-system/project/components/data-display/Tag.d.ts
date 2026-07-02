import * as React from 'react'

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'danger'
  /** When provided, renders a × button and calls this on click. */
  onRemove?: () => void
  children?: React.ReactNode
}

/**
 * Compact label chip for roles, permissions, and multi-select values. Removable when `onRemove` is set.
 * @dsComponent
 */
export function Tag(props: TagProps): JSX.Element
