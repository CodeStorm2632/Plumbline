import * as React from 'react'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

/**
 * Multi-line text field. Vertical resize only; matches Input styling.
 * @dsComponent
 */
export function Textarea(props: TextareaProps): JSX.Element
