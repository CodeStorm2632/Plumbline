import * as React from 'react'

export interface DialogProps {
  open: boolean
  onClose?: () => void
  title?: React.ReactNode
  description?: React.ReactNode
  /** Footer actions row (right-aligned). */
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  closeOnOverlay?: boolean
  children?: React.ReactNode
}

/**
 * Centered modal for confirmations and compact create/edit forms. Overlay + Esc close.
 * @dsComponent
 */
export function Dialog(props: DialogProps): JSX.Element | null
