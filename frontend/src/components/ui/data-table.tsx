import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type Cell,
  type ColumnDef,
  type Row,
  type SortingState,
  type RowData,
} from "@tanstack/react-table";
import { cn } from "../../lib/utils";

function SortIcon({ dir }: { dir: "asc" | "desc" | false }) {
  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        lineHeight: 0,
        marginLeft: "3px",
        flexShrink: 0,
      }}
    >
      <svg width="8" height="6" viewBox="0 0 8 6">
        <path
          d="M4 0l3 4H1z"
          fill={dir === "asc" ? "var(--primary)" : "var(--border-strong)"}
        />
      </svg>
      <svg width="8" height="6" viewBox="0 0 8 6">
        <path
          d="M4 6L1 2h6z"
          fill={dir === "desc" ? "var(--primary)" : "var(--border-strong)"}
        />
      </svg>
    </span>
  );
}

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  zebra?: boolean;
  stickyHeader?: boolean;
  dense?: boolean;
  emptyText?: string;
  className?: string;
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  zebra = false,
  stickyHeader = false,
  dense = false,
  emptyText = "暂无数据",
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const cellPad = dense ? "0 12px" : "0 14px";

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-sm)",
        }}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      background: "var(--muted)",
                      borderBottom: "1px solid var(--border)",
                      padding: cellPad,
                      height: "38px",
                      textAlign: "left",
                      fontSize: "var(--text-xs)",
                      fontWeight: "var(--font-semibold)",
                      color: sorted ? "var(--foreground)" : "var(--muted-foreground)",
                      whiteSpace: "nowrap",
                      cursor: canSort ? "pointer" : "default",
                      userSelect: "none",
                      position: stickyHeader ? "sticky" : "static",
                      top: 0,
                      zIndex: stickyHeader ? 2 : "auto",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {canSort && <SortIcon dir={sorted} />}
                    </span>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  textAlign: "center",
                  color: "var(--muted-foreground)",
                  height: "96px",
                  fontSize: "var(--text-sm)",
                }}
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row, i) => (
              <DataRow
                key={row.id}
                row={row}
                zebra={zebra}
                zebraOdd={i % 2 === 1}
                dense={dense}
                cellPad={cellPad}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function DataRow<TData extends RowData>({
  row,
  zebra,
  zebraOdd,
  dense,
  cellPad,
}: {
  row: Row<TData>;
  zebra: boolean;
  zebraOdd: boolean;
  dense: boolean;
  cellPad: string;
}) {
  const [hover, setHover] = React.useState(false);
  const zebraBg = zebra && zebraOdd ? "var(--muted)" : "transparent";
  return (
    <tr
      style={{
        background: hover ? "var(--accent)" : zebraBg,
        borderBottom: zebra ? "none" : "1px solid var(--border)",
        transition: "background var(--dur-fast) var(--ease-standard)",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {row.getVisibleCells().map((cell: Cell<TData, unknown>) => (
        <td
          key={cell.id}
          style={{
            padding: cellPad,
            height: dense ? "var(--row-h-dense)" : "var(--row-h)",
            verticalAlign: "middle",
            color: "var(--foreground)",
          }}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
}
