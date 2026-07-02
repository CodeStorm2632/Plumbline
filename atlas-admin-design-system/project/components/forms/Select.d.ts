export interface SelectOption {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

export interface SelectProps {
  value?: string
  onChange?: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  invalid?: boolean
}

/**
 * Dropdown single-select with styled popover. Use for dictionaries, status filters, role pickers.
 * @dsComponent
 */
export function Select(props: SelectProps): JSX.Element
