export interface BreadcrumbItem {
  label: React.ReactNode
  href?: string
  onClick?: (e: any) => void
}
export interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

/**
 * Location trail for the header; the last item is the (non-link) current page.
 * @dsComponent
 */
export function Breadcrumb(props: BreadcrumbProps): JSX.Element
