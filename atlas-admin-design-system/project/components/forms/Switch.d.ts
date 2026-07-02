export interface SwitchProps {
  checked?: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
  size?: 'sm' | 'md'
}

/**
 * Binary toggle for status fields (enable/disable, on/off) — common in admin tables.
 * @dsComponent
 */
export function Switch(props: SwitchProps): JSX.Element
