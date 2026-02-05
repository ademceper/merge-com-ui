"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type Row,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table"
import {
  CaretDown,
  CaretDoubleLeft,
  CaretDoubleRight,
  CaretLeft,
  CaretRight,
  CaretUp,
  WarningCircle,
  XCircle,
  Columns,
  Funnel,
  MagnifyingGlass,
  Trash,
  DotsThreeVertical,
  EyeSlash,
} from "@phosphor-icons/react"
import { useId, useMemo, useRef, useState } from "react"

import { cn } from "@merge/ui/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@merge/ui/components/alert-dialog"
import { Button } from "@merge/ui/components/button"
import { Checkbox } from "@merge/ui/components/checkbox"
import { Input } from "@merge/ui/components/input"
import { Label } from "@merge/ui/components/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@merge/ui/components/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@merge/ui/components/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@merge/ui/components/select"

export function Table({
  className,
  ...props
}: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

export function TableHeader({
  className,
  ...props
}: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("sticky top-0 z-10 [&_tr]:border-b", className)}
      {...props}
    />
  )
}

export function TableBody({
  className,
  ...props
}: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0 [&_tr_td:first-child]:w-8", className)}
      {...props}
    />
  )
}

export function TableFooter({
  className,
  ...props
}: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

export function TableRow({
  className,
  ...props
}: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted data-[dragging=true]:opacity-80 data-[dragging=true]:z-10 data-[dragging=true]:relative",
        className
      )}
      {...props}
    />
  )
}

export function TableHead({
  className,
  ...props
}: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-12 min-h-12 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 first:w-8",
        className
      )}
      {...props}
    />
  )
}

export function TableCell({
  className,
  ...props
}: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "h-12 min-h-12 p-2 align-middle overflow-hidden text-ellipsis whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

export function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}


export type DataTableProps<TData> = {
  columns: ColumnDef<TData>[]
  data: TData[]
  emptyMessage?: string
  pageSizeOptions?: number[]
  defaultPageSize?: number
  defaultSorting?: SortingState
  searchColumnId?: string
  searchPlaceholder?: string
  facetFilterColumnId?: string
  facetFilterLabel?: string
  onDeleteRows?: (rows: Row<TData>[]) => void
  onRowClick?: (row: Row<TData>) => void
  toolbar?: React.ReactNode
  className?: string
}

export function DataTable<TData>({
  columns,
  data,
  emptyMessage = "No results.",
  pageSizeOptions = [5, 10, 25, 50],
  defaultPageSize = 10,
  defaultSorting = [],
  searchColumnId,
  searchPlaceholder = "Filter...",
  facetFilterColumnId,
  facetFilterLabel = "Filters",
  onDeleteRows,
  onRowClick,
  toolbar,
  className,
}: DataTableProps<TData>) {
  const id = useId()
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  })
  const [sorting, setSorting] = useState<SortingState>(defaultSorting)
  const inputRef = useRef<HTMLInputElement>(null)

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      columnVisibility,
      pagination,
      sorting,
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    enableSortingRemoval: false,
  })

  const handleDeleteRows = () => {
    const selectedRows = table.getSelectedRowModel().rows
    onDeleteRows?.(selectedRows)
    table.resetRowSelection()
  }

  const facetColumn = facetFilterColumnId
    ? table.getColumn(facetFilterColumnId)
    : null
  const uniqueFacetValues = useMemo(() => {
    if (!facetColumn) return []
    return Array.from(facetColumn.getFacetedUniqueValues().keys()).sort()
  }, [facetColumn])
  const facetCounts = useMemo(() => {
    if (!facetColumn) return new Map<string, number>()
    return facetColumn.getFacetedUniqueValues()
  }, [facetColumn])
  const selectedFacetValues = useMemo(() => {
    const value = facetColumn?.getFilterValue() as string[] | undefined
    return value ?? []
  }, [facetColumn])

  const handleFacetChange = (checked: boolean, value: string) => {
    const current = (facetColumn?.getFilterValue() as string[]) ?? []
    const next = checked
      ? [...current, value]
      : current.filter((v) => v !== value)
    facetColumn?.setFilterValue(next.length ? next : undefined)
  }

  const searchColumn = searchColumnId
    ? table.getColumn(searchColumnId)
    : null
  const searchValue = (searchColumn?.getFilterValue() ?? "") as string

  const [viewOpen, setViewOpen] = useState(false)

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-nowrap items-center justify-between gap-2 sm:flex-wrap sm:gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-initial sm:min-w-0 sm:gap-3">
          {searchColumnId && searchColumn && (
            <div className="relative min-w-0 flex-1 sm:min-w-0 sm:flex-initial">
              <Input
                aria-label={searchPlaceholder}
                className={cn(
                  "peer h-9 min-w-0 flex-1 ps-9 sm:min-w-60",
                  searchValue && "pe-9"
                )}
                id={`${id}-input`}
                onChange={(e) => searchColumn.setFilterValue(e.target.value)}
                placeholder={searchPlaceholder}
                ref={inputRef}
                type="text"
                value={searchValue}
              />
              <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80">
                <MagnifyingGlass size={16} />
              </span>
              {searchValue && (
                <button
                  type="button"
                  aria-label="Clear filter"
                  className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none hover:text-foreground focus-visible:ring-2"
                  onClick={() => {
                    searchColumn.setFilterValue("")
                    inputRef.current?.focus()
                  }}
                >
                  <XCircle size={16} />
                </button>
              )}
            </div>
          )}
          {facetFilterColumnId && facetColumn && uniqueFacetValues.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Funnel size={16} className="-ms-1 opacity-60" />
                  {facetFilterLabel}
                  {selectedFacetValues.length > 0 && (
                    <span className="-me-1 inline-flex h-5 max-h-full items-center rounded border bg-background px-1 text-[0.625rem] font-medium text-muted-foreground/70">
                      {selectedFacetValues.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto min-w-36 p-3">
                <div className="space-y-3">
                  <div className="text-muted-foreground text-xs font-medium">
                    {facetFilterLabel}
                  </div>
                  <div className="space-y-3">
                    {uniqueFacetValues.map((value, i) => (
                      <div
                        key={value}
                        className="flex items-center gap-2"
                      >
                        <Checkbox
                          checked={selectedFacetValues.includes(value)}
                          id={`${id}-facet-${i}`}
                          onCheckedChange={(checked) =>
                            handleFacetChange(!!checked, value)
                          }
                        />
                        <Label
                          className="flex grow justify-between gap-2 font-normal"
                          htmlFor={`${id}-facet-${i}`}
                        >
                          {value}
                          <span className="ms-2 text-muted-foreground text-xs">
                            {facetCounts.get(value)}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
          <DropdownMenu modal={false} open={viewOpen} onOpenChange={setViewOpen}>
            <DropdownMenuTrigger
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-dashed border-input bg-background px-3 text-sm font-medium hover:bg-accent/10 cursor-pointer hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Columns size={16} className="-ms-1 opacity-60" />
              View
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-auto min-w-36 p-1" style={{ zIndex: 2147483647 }}>
              <div className="px-1.5 py-1 text-xs font-medium text-muted-foreground">
                Toggle columns
              </div>
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <label
                    key={col.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    <Checkbox
                      checked={col.getIsVisible()}
                      onCheckedChange={(v) => col.toggleVisibility(!!v)}
                    />
                    <span className="capitalize">{col.id}</span>
                  </label>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {onDeleteRows &&
            table.getSelectedRowModel().rows.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash size={16} className="-ms-1 opacity-60" />
                    Delete
                    <span className="-me-1 inline-flex h-5 max-h-full items-center rounded border bg-background px-1 text-[0.625rem] font-medium text-muted-foreground/70">
                      {table.getSelectedRowModel().rows.length}
                    </span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full border">
                      <WarningCircle size={16} className="opacity-80" />
                    </div>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete{" "}
                        {table.getSelectedRowModel().rows.length} selected{" "}
                        {table.getSelectedRowModel().rows.length === 1
                          ? "row"
                          : "rows"}
                        .
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteRows}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          {toolbar}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg [-webkit-overflow-scrolling:touch]">
        <Table className="min-w-full table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                className="hover:bg-transparent"
                key={headerGroup.id}
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    className="h-12"
                    key={header.id}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="flex h-full w-full cursor-pointer select-none items-center gap-1.5 rounded-md px-0 text-left outline-none hover:opacity-80"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: (
                                <CaretUp
                                  size={16}
                                  className="shrink-0 text-muted-foreground"
                                />
                              ),
                              desc: (
                                <CaretDown
                                  size={16}
                                  className="shrink-0 text-muted-foreground"
                                />
                              ),
                            }[header.column.getIsSorted() as string] ?? (
                              <CaretDown
                                size={16}
                                className="shrink-0 text-muted-foreground opacity-50"
                              />
                            )}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem
                            onClick={() => header.column.toggleSorting(false)}
                          >
                            <CaretUp size={16} className="mr-2" />
                            Asc
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => header.column.toggleSorting(true)}
                          >
                            <CaretDown size={16} className="mr-2" />
                            Desc
                          </DropdownMenuItem>
                          {header.column.getCanHide() && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => header.column.toggleVisibility(false)}
                              >
                                <EyeSlash size={16} className="mr-2" />
                                Hide
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  data-state={row.getIsSelected() && "selected"}
                  key={row.id}
                  className={onRowClick ? "cursor-pointer" : undefined}
                  onClick={
                    onRowClick
                      ? (e) => {
                          const target = e.target as HTMLElement
                          if (!target.closest("button, a, [role='button'], [data-slot='dropdown-menu-trigger']"))
                            onRowClick(row)
                        }
                      : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="last:py-0" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={columns.length}
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor={id} className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(v) => table.setPageSize(Number(v))}
            >
              <SelectTrigger className="h-8 min-h-8 w-20" id={id}>
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top" className="**:data-[slot=select-item]:min-h-8 **:data-[slot=select-item]:py-1.5 **:data-[slot=select-item]:text-sm">
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden size-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              aria-label="Go to first page"
            >
              <CaretDoubleLeft size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Go to previous page"
            >
              <CaretLeft size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Go to next page"
            >
              <CaretRight size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hidden size-8 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              aria-label="Go to last page"
            >
              <CaretDoubleRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DataTableRowActions<TData>({
  children,
}: {
  row: Row<TData>
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="relative z-0"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          aria-label="Open menu"
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <DotsThreeVertical size={16} />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-auto min-w-32 p-1"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div onClick={() => setOpen(false)} className="flex flex-col">
            {children ?? (
              <>
                <button type="button" className="rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground">
                  Edit
                </button>
                <button type="button" className="rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground">
                  Duplicate
                </button>
                <div className="my-1 h-px bg-border" />
                <button type="button" className="rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10 hover:text-destructive">
                  Delete
                </button>
              </>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export type { ColumnDef, FilterFn, Row, SortingState }
