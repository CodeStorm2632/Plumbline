import * as React from 'react'

export interface TabItem {
  value: string
  label: React.ReactNode
  count?: number
  disabled?: boolean
}
export interface TabsProps {
  tabs: TabItem[]
  value?: string
  onChange?: (value: string) => void
}

/**
 * Underline tabs for switching views within a page (e.g. 登录日志 / 操作日志).
 * @dsComponent
 */
export function Tabs(props: TabsProps): JSX.Element
