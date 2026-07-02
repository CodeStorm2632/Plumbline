import * as React from 'react'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg'
  /** Red border + focus ring for validation errors. */
  invalid?: boolean
  /** Icon/element rendered inside, before the field. */
  leading?: React.ReactNode
  /** Icon/element rendered inside, after the field. */
  trailing?: React.ReactNode
}

/**
 * Single-line text field with optional leading/trailing adornments and invalid state.
 * @dsComponent
 */
export function Input(props: InputProps): JSX.Element
