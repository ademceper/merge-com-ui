"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@merge-rd/ui/components/alert-dialog";
import { Button } from "@merge-rd/ui/components/button";
import { Checkbox } from "@merge-rd/ui/components/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { Input } from "@merge-rd/ui/components/input";
import { Label } from "@merge-rd/ui/components/label";
import { Popover, PopoverContent, PopoverTrigger } from "@merge-rd/ui/components/popover";
import { cn } from "@merge-rd/ui/lib/utils";
import {
    Columns,
    Funnel,
    MagnifyingGlass,
    Trash,
    WarningCircle,
    XCircle
} from "@phosphor-icons/react";
import type { Row, Table } from "@tanstack/react-table";
import * as React from "react";
import { useCallback, useMemo, useRef, useState } from "react";

type DataTableToolbarProps<TData> = {
    id: string;
    table: Table<TData>;
    searchColumnId?: string;
    searchPlaceholder?: string;
    facetFilterColumnId?: string;
    facetFilterLabel?: string;
    onDeleteRows?: (rows: Row<TData>[]) => void;
    toolbar?: React.ReactNode;
};

function DataTableToolbarInner<TData>({
    id,
    table,
    searchColumnId,
    searchPlaceholder = "Filter...",
    facetFilterColumnId,
    facetFilterLabel = "Filters",
    onDeleteRows,
    toolbar
}: DataTableToolbarProps<TData>) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [viewOpen, setViewOpen] = useState(false);

    const facetColumn = facetFilterColumnId ? table.getColumn(facetFilterColumnId) : null;
    const uniqueFacetValues = useMemo(() => {
        if (!facetColumn) return [];
        return Array.from(facetColumn.getFacetedUniqueValues().keys()).sort();
    }, [facetColumn]);
    const facetCounts = useMemo(() => {
        if (!facetColumn) return new Map<string, number>();
        return facetColumn.getFacetedUniqueValues();
    }, [facetColumn]);
    const selectedFacetValues = useMemo(() => {
        const value = facetColumn?.getFilterValue() as string[] | undefined;
        return value ?? [];
    }, [facetColumn]);

    const handleFacetChange = useCallback(
        (checked: boolean, value: string) => {
            const current = (facetColumn?.getFilterValue() as string[]) ?? [];
            const next = checked ? [...current, value] : current.filter(v => v !== value);
            facetColumn?.setFilterValue(next.length ? next : undefined);
        },
        [facetColumn]
    );

    const searchColumn = searchColumnId ? table.getColumn(searchColumnId) : null;
    const searchValue = (searchColumn?.getFilterValue() ?? "") as string;

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            searchColumn?.setFilterValue(e.target.value);
        },
        [searchColumn]
    );

    const handleClearSearch = useCallback(() => {
        searchColumn?.setFilterValue("");
        inputRef.current?.focus();
    }, [searchColumn]);

    const handleDeleteRows = useCallback(() => {
        const selectedRows = table.getSelectedRowModel().rows;
        onDeleteRows?.(selectedRows);
        table.resetRowSelection();
    }, [table, onDeleteRows]);

    return (
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
                            onChange={handleSearchChange}
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
                                onClick={handleClearSearch}
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
                                                checked={selectedFacetValues.includes(
                                                    value
                                                )}
                                                id={`${id}-facet-${i}`}
                                                onCheckedChange={checked =>
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
                    <DropdownMenuTrigger className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-dashed border-input bg-background px-3 text-sm font-medium hover:bg-accent/10 cursor-pointer hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                        <Columns size={16} className="-ms-1 opacity-60" />
                        View
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-auto min-w-36 p-1"
                        style={{ zIndex: 2147483647 }}
                    >
                        <div className="px-1.5 py-1 text-xs font-medium text-muted-foreground">
                            Toggle columns
                        </div>
                        {table
                            .getAllColumns()
                            .filter(col => col.getCanHide())
                            .map(col => (
                                <label
                                    key={col.id}
                                    className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-accent hover:text-accent-foreground"
                                >
                                    <Checkbox
                                        checked={col.getIsVisible()}
                                        onCheckedChange={v => col.toggleVisibility(!!v)}
                                    />
                                    <span className="capitalize">{col.id}</span>
                                </label>
                            ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                {onDeleteRows && table.getSelectedRowModel().rows.length > 0 && (
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
    );
}

export const DataTableToolbar = React.memo(
    DataTableToolbarInner
) as typeof DataTableToolbarInner;
