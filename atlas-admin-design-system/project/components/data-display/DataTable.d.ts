import * as React from 'react'

export interface DataTableColumn<T = any> {
  key: string
  header: React.ReactNode
  width?: string | number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  /** Custom cell renderer. Receives the row and its index. */
  render?: (row: T, index: number) => React.ReactNode
}

export interface DataTableProps<T = any> {
  columns: DataTableColumn<T>[]
  data: T[]
  /** Property name or accessor for the stable row key. */
  rowKey?: string | ((row: T) => string | number)
  /** Alternating row background instead of per-row dividers. */
  zebra?: boolean
  selectable?: boolean
  selectedKeys?: (string | number)[]
  onSelectionChange?: (keys: (string | number)[]) => void
  sortKey?: string
  sortDir?: 'asc' | 'desc'
  onSort?: (key: string, dir: 'asc' | 'desc') => void
  /** Tighter row height for high-density views. */
  dense?: boolean
  stickyHeader?: boolean
  emptyText?: React.ReactNode
}

/**
 * Config-driven data table: sortable headers, zebra/divider rows, row selection, sticky header, dense mode.
 * @dsComponent
 * @startingPoint section="Data Display" subtitle="Sortable, selectable data table" viewport="700x360"
 */
export function DataTable<T = any>(props: DataTableProps<T>): JSX.Element
