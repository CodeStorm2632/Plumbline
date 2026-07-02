import * as React from 'react'

export interface CheckboxProps {
  checked?: boolean
  /** Half-checked state — used for parent nodes in permission trees. */
  indeterminate?: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
  /** Optional inline label to the right of the box. */
  label?: React.ReactNode
  id?: string
}

/**
 * Checkbox with checked + indeterminate states. Powers permission/menu trees.
 * @dsComponent
 */
export function Checkbox(props: CheckboxProps): JSX.Element
