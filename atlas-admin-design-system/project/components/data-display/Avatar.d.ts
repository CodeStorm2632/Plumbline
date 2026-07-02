export interface AvatarProps {
  src?: string
  /** Name — used for initials fallback and deterministic tint. */
  name?: string
  size?: 'sm' | 'md' | 'lg' | number
  shape?: 'circle' | 'square'
}

/**
 * User avatar with image or auto-tinted initials fallback.
 * @dsComponent
 */
export function Avatar(props: AvatarProps): JSX.Element
