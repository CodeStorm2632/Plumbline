import * as React from 'react'

export interface AlertProps {
  tone?: 'info' | 'success' | 'warning' | 'danger'
  title?: React.ReactNode
  children?: React.ReactNode
  /** Renders a dismiss × and calls this. */
  onClose?: () => void
}

/**
 * Inline contextual message with a semantic tone and built-in status icon.
 * @dsComponent
 */
export function Alert(props: AlertProps): JSX.Element
