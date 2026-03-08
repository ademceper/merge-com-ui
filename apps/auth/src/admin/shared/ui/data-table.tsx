"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@merge-rd/ui/components/table";
import { cn } from "@merge-rd/ui/lib/utils";
import { CaretDown, CaretUp, DotsThreeVertical, EyeSlash } from "@phosphor-icons/react";
import {
    type ColumnDef,
    type ColumnFiltersState,
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
    type VisibilityState
} from "@tanstack/react-table";
import * as React from "react";
import { useCallback, useId, useState } from "react";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

type DataTableProps<TData> = {
    columns: ColumnDef<TData>[];
    data: TData[];
    emptyMessage?: string;
    pageSizeOptions?: number[];
    defaultPageSize?: number;
    defaultSorting?: SortingState;
    searchColumnId?: string;
    searchPlaceholder?: string;
    facetFilterColumnId?: string;
    facetFilterLabel?: string;
    onDeleteRows?: (rows: Row<TData>[]) => void;
    onRowClick?: (row: Row<TData>) => void;
    toolbar?: React.ReactNode;
    emptyContent?: React.ReactNode;
    getRowCanExpand?: (row: Row<TData>) => boolean;
    renderSubRow?: (row: Row<TData>) => React.ReactNode;
    className?: string;
};

export function DataTable<TData>({
    columns,
    data,
    emptyMessage = "No results.",
    emptyContent,
    getRowCanExpand,
    renderSubRow,
    pageSizeOptions = [5, 10, 25, 50],
    defaultPageSize = 10,
    defaultSorting = [],
    searchColumnId,
    searchPlaceholder,
    facetFilterColumnId,
    facetFilterLabel,
    onDeleteRows,
    onRowClick,
    toolbar,
    className
}: DataTableProps<TData>) {
    const id = useId();
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: defaultPageSize
    });
    const [sorting, setSorting] = useState<SortingState>(defaultSorting);

    const table = useReactTable({
        data,
        columns,
        state: {
            columnFilters,
            columnVisibility,
            pagination,
            sorting
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
        enableSortingRemoval: false
    });

    const handleRowClick = useCallback(
        (e: React.MouseEvent, row: Row<TData>) => {
            const target = e.target as HTMLElement;
            if (
                !target.closest(
                    "button, a, [role='button'], [data-slot='dropdown-menu-trigger']"
                )
            )
                onRowClick?.(row);
        },
        [onRowClick]
    );

    return (
        <div className={cn("space-y-4", className)}>
            <DataTableToolbar
                id={id}
                table={table}
                searchColumnId={searchColumnId}
                searchPlaceholder={searchPlaceholder}
                facetFilterColumnId={facetFilterColumnId}
                facetFilterLabel={facetFilterLabel}
                onDeleteRows={onDeleteRows}
                toolbar={toolbar}
            />

            <div className="overflow-hidden rounded-lg [-webkit-overflow-scrolling:touch]">
                <Table className="min-w-full table-fixed">
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow
                                className="hover:bg-transparent"
                                key={headerGroup.id}
                            >
                                {headerGroup.headers.map(header => (
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
                                                            header.column.columnDef
                                                                .header,
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
                                                            )
                                                        }[
                                                            header.column.getIsSorted() as string
                                                        ] ?? (
                                                            <CaretDown
                                                                size={16}
                                                                className="shrink-0 text-muted-foreground opacity-50"
                                                            />
                                                        )}
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            header.column.toggleSorting(
                                                                false
                                                            )
                                                        }
                                                    >
                                                        <CaretUp
                                                            size={16}
                                                            className="mr-2"
                                                        />
                                                        Asc
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            header.column.toggleSorting(
                                                                true
                                                            )
                                                        }
                                                    >
                                                        <CaretDown
                                                            size={16}
                                                            className="mr-2"
                                                        />
                                                        Desc
                                                    </DropdownMenuItem>
                                                    {header.column.getCanHide() && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    header.column.toggleVisibility(
                                                                        false
                                                                    )
                                                                }
                                                            >
                                                                <EyeSlash
                                                                    size={16}
                                                                    className="mr-2"
                                                                />
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
                            table.getRowModel().rows.map(row => (
                                <React.Fragment key={row.id}>
                                    <TableRow
                                        data-state={row.getIsSelected() && "selected"}
                                        className={
                                            onRowClick ? "cursor-pointer" : undefined
                                        }
                                        onClick={
                                            onRowClick
                                                ? e => handleRowClick(e, row)
                                                : undefined
                                        }
                                    >
                                        {row.getVisibleCells().map(cell => (
                                            <TableCell
                                                className="last:py-0"
                                                key={cell.id}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                    {renderSubRow && getRowCanExpand?.(row) && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={row.getVisibleCells().length}
                                            >
                                                {renderSubRow(row)}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    className="h-24 text-center"
                                    colSpan={columns.length}
                                >
                                    {emptyContent ?? emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <DataTablePagination
                id={id}
                table={table}
                pageSizeOptions={pageSizeOptions}
            />
        </div>
    );
}

export function DataTableRowActions<TData>({
    children
}: {
    row: Row<TData>;
    children?: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    return (
        <div
            className="relative z-0"
            onClick={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
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
                    onCloseAutoFocus={e => e.preventDefault()}
                >
                    <div onClick={() => setOpen(false)} className="flex flex-col">
                        {children ?? (
                            <>
                                <button
                                    type="button"
                                    className="rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    className="rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                >
                                    Duplicate
                                </button>
                                <div className="my-1 h-px bg-border" />
                                <button
                                    type="button"
                                    className="rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@merge-rd/ui/components/table";

export type { ColumnDef, Row };
