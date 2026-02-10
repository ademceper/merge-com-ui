import * as React from "react"

import { cn } from "@merge/ui/lib/utils"
import { Button } from "@merge/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@merge/ui/components/select"
import { CaretLeftIcon, CaretRightIcon, DotsThreeIcon } from "@phosphor-icons/react"

export function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn(
        "mx-auto flex w-full justify-center",
        className
      )}
      {...props}
    />
  )
}

export function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("gap-0.5 flex items-center", className)}
      {...props}
    />
  )
}

export function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

export function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      asChild
      variant={isActive ? "outline" : "ghost"}
      size={size}
      className={cn(className)}
    >
      <a
        aria-current={isActive ? "page" : undefined}
        data-slot="pagination-link"
        data-active={isActive}
        {...props}
      />
    </Button>
  )
}

export function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("pl-1.5!", className)}
      {...props}
    >
      <CaretLeftIcon data-icon="inline-start" />
      <span className="hidden sm:block">
        Previous
      </span>
    </PaginationLink>
  )
}

export function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("pr-1.5!", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <CaretRightIcon data-icon="inline-end" />
    </PaginationLink>
  )
}

export function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4 flex items-center justify-center",
        className
      )}
      {...props}
    >
      <DotsThreeIcon
      />
      <span className="sr-only">More pages</span>
    </span>
  )
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

export type TablePaginationProps = {
  id?: string
  count: number
  first: number
  max: number
  onNextClick: (nextFirst: number) => void
  onPreviousClick: (prevFirst: number) => void
  onPerPageSelect: (max: number, first: number) => void
  variant?: "top" | "bottom"
  pageSizeOptions?: number[]
  t?: (key: string, opts?: { page?: number; total?: number }) => string
}

export function TablePagination({
  id,
  variant = "top",
  count,
  first,
  max,
  onNextClick,
  onPreviousClick,
  onPerPageSelect,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  t = (key: string, opts?: { page?: number; total?: number }) =>
    key === "paginationPage" && opts ? `Page ${opts.page} of ${opts.total}` : "Pagination",
}: TablePaginationProps) {
  const page = Math.round(first / max)
  const totalPages = Math.ceil((count + page * max) / max) || 1
  const currentPage = page + 1
  const firstIndex = first + 1
  const lastIndex = Math.min(first + max, count + page * max)

  return (
    <div
      id={id}
      className="flex items-center gap-2"
      aria-label={`${t("pagination")} ${variant}`}
    >
      <span className="text-muted-foreground text-sm whitespace-nowrap">
        <strong>{firstIndex}</strong> - <strong>{lastIndex}</strong>
      </span>
      <Select
        value={String(max)}
        onValueChange={(v) => onPerPageSelect(Number(v), 0)}
      >
        <SelectTrigger size="sm" className="h-8 min-h-8 w-[70px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {pageSizeOptions.map((n) => (
            <SelectItem key={n} value={String(n)}>
              {n}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e?.preventDefault?.()
                if (currentPage > 1) onPreviousClick((currentPage - 2) * max)
              }}
              className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          <PaginationItem>
            <span className="text-muted-foreground px-2 text-sm">
              {t("paginationPage", { page: currentPage, total: totalPages })}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e?.preventDefault?.()
                if (currentPage < totalPages) onNextClick(currentPage * max)
              }}
              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
