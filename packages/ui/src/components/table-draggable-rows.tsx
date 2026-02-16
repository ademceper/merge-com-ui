"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { CaretDown, CaretUp, DotsSixVertical } from "@phosphor-icons/react";
import * as React from "react";
import type { CSSProperties } from "react";

import { Button } from "@merge/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@merge/ui/components/table";

export type DraggableTableRowsProps<TData> = {
  columns: ColumnDef<TData>[];
  data: TData[];
  getRowId: (row: TData) => string;
  onOrderChange?: (reorderedData: TData[]) => void;
  setData: React.Dispatch<React.SetStateAction<TData[]>>;
};

export function DraggableTableRows<TData>({
  columns,
  data,
  getRowId,
  onOrderChange,
  setData,
}: DraggableTableRowsProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (originalRow) => getRowId(originalRow),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  const rowIds = React.useMemo(
    () => table.getRowModel().rows.map((row) => row.id),
    [data],
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = rowIds.indexOf(active.id as string);
      const newIndex = rowIds.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;
      setData((prev) => {
        const next = arrayMove(prev, oldIndex, newIndex);
        onOrderChange?.(next);
        return next;
      });
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {}),
  );

  return (
    <DndContext
      collisionDetection={closestCenter}
      id={React.useId()}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow className="bg-muted/50" key={headerGroup.id}>
              <TableHead className="w-10 border-t px-2" />
              {headerGroup.headers.map((header) => (
                <TableHead
                  aria-sort={
                    header.column.getIsSorted() === "asc"
                      ? "ascending"
                      : header.column.getIsSorted() === "desc"
                        ? "descending"
                        : "none"
                  }
                  className="border-t"
                  key={header.id}
                >
                  <div className="flex items-center justify-start gap-1">
                    <span className="grow truncate">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </span>
                    <Button
                      className="group -mr-1 size-7 shadow-none"
                      onClick={header.column.getToggleSortingHandler()}
                      onKeyDown={(e) => {
                        if (
                          header.column.getCanSort() &&
                          (e.key === "Enter" || e.key === " ")
                        ) {
                          e.preventDefault();
                          header.column.getToggleSortingHandler()?.(e);
                        }
                      }}
                      size="icon"
                      variant="ghost"
                    >
                      {{
                        asc: (
                          <CaretUp
                            aria-hidden
                            className="size-4 shrink-0 opacity-60"
                          />
                        ),
                        desc: (
                          <CaretDown
                            aria-hidden
                            className="size-4 shrink-0 opacity-60"
                          />
                        ),
                      }[header.column.getIsSorted() as string] ?? (
                        <CaretUp
                          aria-hidden
                          className="size-4 shrink-0 opacity-0 group-hover:opacity-60"
                        />
                      )}
                    </Button>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          <SortableContext
            items={rowIds}
            strategy={verticalListSortingStrategy}
          >
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <DraggableRow key={row.id} row={row} />
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={columns.length + 1}
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </SortableContext>
        </TableBody>
      </Table>
    </DndContext>
  );
}

function DraggableRow<TData>({ row }: { row: Row<TData> }) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: row.id });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      ref={setNodeRef}
      style={style}
    >
      <TableCell className="w-10 border-t px-2">
        <Button
          aria-label="Sırayı değiştirmek için sürükle"
          className="-ml-1 size-8 cursor-grab active:cursor-grabbing"
          size="icon"
          variant="ghost"
          {...attributes}
          {...listeners}
        >
          <DotsSixVertical
            aria-hidden
            className="size-5 opacity-60"
          />
        </Button>
      </TableCell>
      {row.getVisibleCells().map((cell) => (
        <TableCell className="truncate border-t" key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}
