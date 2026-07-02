import * as React from 'react'

export interface SidebarNavItem {
  key: string
  title: React.ReactNode
  icon?: React.ReactNode
  url?: string
  badge?: React.ReactNode
  /** Nested items make this a collapsible parent. */
  items?: SidebarNavItem[]
  defaultOpen?: boolean
}
export interface SidebarNavGroup {
  title?: string
  items: SidebarNavItem[]
}
export interface SidebarNavProps {
  groups: SidebarNavGroup[]
  /** key of the active leaf item. */
  active?: string
  onNavigate?: (key: string, item: SidebarNavItem) => void
  /** Icon-only rail. */
  collapsed?: boolean
}

/**
 * Grouped, multi-level collapsible sidebar menu with active state, badges, and icon-only mode.
 * @dsComponent
 * @startingPoint section="Navigation" subtitle="Multi-level admin sidebar menu" viewport="280x520"
 */
export function SidebarNav(props: SidebarNavProps): JSX.Element
