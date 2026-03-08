"use client";

import { Button } from "@merge-rd/ui/components/button";
import { Label } from "@merge-rd/ui/components/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@merge-rd/ui/components/select";
import {
    CaretDoubleLeft,
    CaretDoubleRight,
    CaretLeft,
    CaretRight
} from "@phosphor-icons/react";
import type { Table } from "@tanstack/react-table";
import * as React from "react";
import { useCallback } from "react";

type DataTablePaginationProps<TData> = {
    id: string;
    table: Table<TData>;
    pageSizeOptions: number[];
};

function DataTablePaginationInner<TData>({
    id,
    table,
    pageSizeOptions
}: DataTablePaginationProps<TData>) {
    const handlePageSizeChange = useCallback(
        (v: string) => {
            table.setPageSize(Number(v));
        },
        [table]
    );

    return (
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
                        onValueChange={handlePageSizeChange}
                    >
                        <SelectTrigger className="h-8 min-h-8 w-20" id={id}>
                            <SelectValue
                                placeholder={table.getState().pagination.pageSize}
                            />
                        </SelectTrigger>
                        <SelectContent
                            side="top"
                            className="**:data-[slot=select-item]:min-h-8 **:data-[slot=select-item]:py-1.5 **:data-[slot=select-item]:text-sm"
                        >
                            {pageSizeOptions.map(size => (
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
    );
}

export const DataTablePagination = React.memo(
    DataTablePaginationInner
) as typeof DataTablePaginationInner;
