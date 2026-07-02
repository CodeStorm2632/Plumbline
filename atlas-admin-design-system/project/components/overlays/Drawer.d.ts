import * as React from 'react'

export interface DrawerProps {
  open: boolean
  onClose?: () => void
  title?: React.ReactNode
  description?: React.ReactNode
  footer?: React.ReactNode
  side?: 'right' | 'left'
  size?: 'sm' | 'md' | 'lg'
  children?: React.ReactNode
}

/**
 * Side sheet for longer create/edit forms — slides from the right by default.
 * @dsComponent
 */
export function Drawer(props: DrawerProps): JSX.Element | null
