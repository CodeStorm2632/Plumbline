import * as React from 'react'

export interface PermissionNode {
  key: string
  label: React.ReactNode
  /** Permission code, shown as a mono chip (e.g. system:user:add). */
  code?: string
  /** 'menu' | 'button' — button nodes get a 按钮 tag. */
  type?: 'menu' | 'button'
  children?: PermissionNode[]
}
export interface PermissionTreeProps {
  nodes: PermissionNode[]
  checkedKeys: string[]
  /** Called with the full next list of checked keys after cascade. */
  onChange?: (keys: string[]) => void
  defaultExpandAll?: boolean
}

/**
 * Expandable checkbox tree with parent→child cascade and indeterminate parents — for role permission assignment.
 * @dsComponent
 * @startingPoint section="Admin" subtitle="Role permission checkbox tree" viewport="480x420"
 */
export function PermissionTree(props: PermissionTreeProps): JSX.Element
