import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@merge-rd/ui/components/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@merge-rd/ui/components/pagination";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export type TablePaginationProps = {
  id?: string;
  count: number;
  first: number;
  max: number;
  onNextClick: (nextFirst: number) => void;
  onPreviousClick: (prevFirst: number) => void;
  onPerPageSelect: (max: number, first: number) => void;
  variant?: "top" | "bottom";
  pageSizeOptions?: number[];
  t?: (key: string, opts?: { page?: number; total?: number }) => string;
};

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
    key === "paginationPage" && opts
      ? `Page ${opts.page} of ${opts.total}`
      : "Pagination",
}: TablePaginationProps) {
  const page = Math.round(first / max);
  const totalPages = Math.ceil((count + page * max) / max) || 1;
  const currentPage = page + 1;
  const firstIndex = first + 1;
  const lastIndex = Math.min(first + max, count + page * max);

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
                e?.preventDefault?.();
                if (currentPage > 1) onPreviousClick((currentPage - 2) * max);
              }}
              className={
                currentPage <= 1 ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>
          <PaginationItem>
            <span className="text-muted-foreground px-2 text-sm">
              {t("paginationPage", {
                page: currentPage,
                total: totalPages,
              })}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e?.preventDefault?.();
                if (currentPage < totalPages) onNextClick(currentPage * max);
              }}
              className={
                currentPage >= totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
