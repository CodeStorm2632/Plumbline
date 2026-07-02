export interface RadioOption {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

export interface RadioGroupProps {
  value?: string
  onChange?: (value: string) => void
  options: RadioOption[]
  name?: string
  direction?: 'vertical' | 'horizontal'
  disabled?: boolean
}

/**
 * Single choice from a short, mutually-exclusive option set.
 * @dsComponent
 */
export function RadioGroup(props: RadioGroupProps): JSX.Element
