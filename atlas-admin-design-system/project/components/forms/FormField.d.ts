import * as React from 'react'

export interface FormFieldProps {
  label?: React.ReactNode
  /** Renders a red asterisk before the label. */
  required?: boolean
  /** Error message — replaces help text and colors it destructive. */
  error?: React.ReactNode
  /** Muted hint below the control. */
  help?: React.ReactNode
  htmlFor?: string
  children?: React.ReactNode
}

/**
 * Field wrapper: label (with required marker) + control + help/error text. Wrap any Input/Select/etc.
 * @dsComponent
 */
export function FormField(props: FormFieldProps): JSX.Element
