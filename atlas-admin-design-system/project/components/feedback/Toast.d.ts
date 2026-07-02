import * as React from 'react'

export interface ToastProps {
  tone?: 'info' | 'success' | 'warning' | 'danger'
  title?: React.ReactNode
  description?: React.ReactNode
  onClose?: () => void
}

/**
 * Transient corner notification for action results ("保存成功"). Presentational — you control mount/timeout.
 * @dsComponent
 */
export function Toast(props: ToastProps): JSX.Element
