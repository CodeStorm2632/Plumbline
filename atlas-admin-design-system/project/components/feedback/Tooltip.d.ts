import * as React from 'react'

export interface TooltipProps {
  label: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  children: React.ReactNode
}

/**
 * Hover/focus tooltip for icon buttons and truncated cells.
 * @dsComponent
 */
export function Tooltip(props: TooltipProps): JSX.Element
