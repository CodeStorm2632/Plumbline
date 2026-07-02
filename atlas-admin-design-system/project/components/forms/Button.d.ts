import * as React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. `default` is the indigo primary action. */
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'
  /** Control height. `icon` / `icon-sm` render square icon-only buttons. */
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'
  disabled?: boolean
  children?: React.ReactNode
}

/**
 * Primary action control. Indigo `default`, plus secondary/outline/ghost/destructive/link.
 * @dsComponent
 * @startingPoint section="Forms" subtitle="Buttons, variants & sizes" viewport="700x160"
 */
export function Button(props: ButtonProps): JSX.Element
