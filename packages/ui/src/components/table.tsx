"use client"

import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@merge-rd/ui/lib/utils"
import { ArrowsDownUp, CaretDown, CaretLeft, CaretRight, CaretUp } from "@phosphor-icons/react"
import { Button } from "@merge-rd/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@merge-rd/ui/components/select"

export type TableSortDirection = "asc" | "desc" | "ASC" | "DESC" | false

interface TableProps extends React.ComponentProps<"table"> {
  containerClassname?: string
  isLoading?: boolean
  loadingRowsCount?: number
  loadingRow?: React.ReactNode
}

interface TableHeadProps extends React.ComponentProps<"th"> {
  sortable?: boolean
  sortDirection?: TableSortDirection
  onSort?: () => void
}

const LoadingRow = () => (
  <TableRow>
    <TableCell className="animate-pulse" colSpan={100}>
      <div className="h-8 w-full rounded-md bg-neutral-100 dark:bg-neutral-800" />
    </TableCell>
  </TableRow>
)

function Table({
  className,
  containerClassname,
  isLoading,
  loadingRowsCount = 5,
  loadingRow,
  children,
  ref,
  ...props
}: TableProps) {
  return (
    <div
      data-slot="table-container"
      className={cn(
        "border-neutral-alpha-200 shadow-xs relative w-full overflow-x-auto rounded-lg border",
        containerClassname
      )}
    >
      <table
        ref={ref}
        data-slot="table"
        className={cn(
          "relative w-full caption-bottom border-separate border-spacing-0 text-sm",
          className
        )}
        {...props}
      >
        {children}
        {isLoading && (
          <TableBody>
            {Array.from({ length: loadingRowsCount }).map((_, index) => (
              <React.Fragment key={index}>
                {loadingRow || <LoadingRow />}
              </React.Fragment>
            ))}
          </TableBody>
        )}
      </table>
    </div>
  )
}

function TableHeader({
  className,
  ...props
}: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "sticky top-0 z-10 bg-neutral-50 shadow-[0_0_0_1px_hsl(var(--neutral-alpha-200))] dark:bg-neutral-900",
        className
      )}
      {...props}
    />
  )
}

function TableBody({
  className,
  ...props
}: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("", className)}
      {...props}
    />
  )
}

function TableFooter({
  className,
  ...props
}: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-neutral-50 sticky bottom-0 shadow-[0_0_0_1px_hsl(var(--neutral-alpha-200))] dark:bg-neutral-900",
        className
      )}
      {...props}
    />
  )
}

function TableRow({
  className,
  ...props
}: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "[&>td]:border-neutral-alpha-100 [&>td]:border-b last-of-type:[&>td]:border-0",
        className
      )}
      {...props}
    />
  )
}

function TableHead({
  className,
  children,
  sortable,
  sortDirection,
  onSort,
  ...props
}: TableHeadProps) {
  const content = (
    <div
      className={cn(
        "flex items-center gap-1",
        sortable && "hover:text-foreground-900 cursor-pointer"
      )}
    >
      {children}
      {sortable && (
        <>
          {typeof sortDirection === "string" && sortDirection.toLowerCase() === "asc" && (
            <CaretUp weight="fill" className="text-text-sub-600 size-4" />
          )}
          {typeof sortDirection === "string" && sortDirection.toLowerCase() === "desc" && (
            <CaretDown weight="fill" className="text-text-sub-600 size-4" />
          )}
          {!sortDirection && (
            <ArrowsDownUp weight="fill" className="text-text-sub-600 size-4" />
          )}
        </>
      )}
    </div>
  )

  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground-600 h-10 px-6 py-2 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-0.5",
        className
      )}
      {...props}
    >
      {sortable ? (
        <div role="button" onClick={onSort}>
          {content}
        </div>
      ) : (
        content
      )}
    </th>
  )
}

export const tableCellVariants = cva("px-6 py-2 align-middle")

function TableCell({
  className,
  ...props
}: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(tableCellVariants(), className)}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

// Pagination Footer

type PaginationGroupProps = {
  children: React.ReactNode
}

function PaginationGroup({ children }: PaginationGroupProps) {
  return (
    <div className="flex items-center overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
      {children}
    </div>
  )
}

type PaginationNavButtonProps = {
  children: React.ReactNode
  disabled?: boolean
  onClick: () => void
  "aria-label"?: string
}

function PaginationNavButton({
  children,
  disabled,
  onClick,
  "aria-label": ariaLabel,
}: PaginationNavButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className="rounded-none border-0 border-r border-neutral-200 p-1.5 last:border-r-0 text-neutral-500 hover:text-neutral-900 disabled:text-neutral-300 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-100 dark:disabled:text-neutral-600"
    >
      {children}
    </Button>
  )
}

type TablePaginationFooterProps = {
  pageSize: number
  currentPageItemsCount?: number
  onPreviousPage: () => void
  onNextPage: () => void
  onPageSizeChange: (pageSize: number) => void
  hasPreviousPage: boolean
  hasNextPage: boolean
  className?: string
  pageSizeOptions?: number[]
  itemName?: string
  totalCountCapped?: boolean
  totalCount?: number
}

function TablePaginationFooter({
  pageSize,
  onPreviousPage,
  onNextPage,
  onPageSizeChange,
  hasPreviousPage,
  hasNextPage,
  className,
  pageSizeOptions = [10, 20, 50],
  totalCountCapped,
  totalCount,
}: TablePaginationFooterProps) {
  return (
    <div className={cn("flex w-full items-center bg-neutral-50 px-3 py-2 dark:bg-neutral-900", className)}>
      <div className="flex flex-1 items-center gap-1 pl-0 px-2">
        {totalCount !== undefined && (
          <>
            {totalCountCapped ? (
              <span className="text-xs font-medium text-neutral-500">
                Over 50,000
              </span>
            ) : (
              <span className="text-xs font-medium text-neutral-500">
                {totalCount?.toLocaleString()}
              </span>
            )}
            <span className="text-xs font-medium text-neutral-400">
              results
            </span>
          </>
        )}
      </div>

      <div className="flex flex-1 items-center justify-center">
        <PaginationGroup>
          <PaginationNavButton
            disabled={!hasPreviousPage}
            onClick={onPreviousPage}
            aria-label="Go to previous page"
          >
            <CaretLeft className="size-5" />
          </PaginationNavButton>
          <PaginationNavButton
            disabled={!hasNextPage}
            onClick={onNextPage}
            aria-label="Go to next page"
          >
            <CaretRight className="size-5" />
          </PaginationNavButton>
        </PaginationGroup>
      </div>

      <div className="flex flex-1 items-center justify-end">
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger size="sm" className="w-auto min-w-20">
            <SelectValue>
              <span className="text-xs font-medium text-neutral-500">
                {pageSize}
              </span>
              <span className="text-xs font-medium text-neutral-400 ml-1">
                / page
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TablePaginationFooter,
}

export type { TableSortDirection as TableHeadSortDirection, TablePaginationFooterProps }
