export interface PaginationProps {
  page?: number
  pageSize?: number
  total?: number
  pageSizeOptions?: number[]
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
}

/**
 * Table pagination: total count, page-size select, and page navigation with ellipsis.
 * @dsComponent
 */
export function Pagination(props: PaginationProps): JSX.Element
