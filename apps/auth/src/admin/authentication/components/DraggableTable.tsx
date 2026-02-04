import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@merge/ui/components/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@merge/ui/components/dropdown-menu";
import { Button } from "@merge/ui/components/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from "@merge/ui/components/tooltip";
import { DotsSixVertical, DotsThreeVertical } from "@phosphor-icons/react";
import { get } from "lodash-es";
import {
    type DragEvent as ReactDragEvent,
    type ReactNode,
    useMemo,
    useRef,
    useState,
} from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@merge/ui/lib/utils";

export type Field<T> = {
    name: string;
    displayKey?: string;
    cellRenderer?: (row: T) => ReactNode;
    thTooltipText?: string;
    width?: number | string;
};

export type Action<T> = {
    title: string;
    onClick?: (event: unknown, row: T) => void;
    isDisabled?: boolean;
    isActionable?: (item: T) => boolean;
};

type DraggableTableProps<T> = Omit<
    React.ComponentProps<typeof Table>,
    "data" | "ref"
> & {
    keyField: string;
    columns: Field<T>[];
    data: T[];
    actions?: Action<T>[];
    onDragFinish: (dragged: string, newOrder: string[]) => void;
    /** @deprecated PF-specific; ignored when using @merge/ui table */
    variant?: string;
};

export function DraggableTable<T>({
    keyField,
    columns,
    data,
    actions,
    onDragFinish,
    className,
    variant: _variant,
    ...props
}: DraggableTableProps<T>) {
    const { t } = useTranslation();
    const bodyRef = useRef<HTMLTableSectionElement>(null);

    const [state, setState] = useState({
        draggedItemId: "",
        draggingToItemIndex: -1,
        dragging: false,
        tempItemOrder: [""],
    });

    const itemOrder: string[] = useMemo(
        () => data.map(d => get(d, keyField)),
        [data, keyField]
    );

    const onDragStart = (evt: ReactDragEvent) => {
        evt.dataTransfer.effectAllowed = "move";
        evt.dataTransfer.setData("text/plain", evt.currentTarget.id);
        const draggedItemId = evt.currentTarget.id;

        const tr = evt.currentTarget.closest("tr");
        if (tr) tr.classList.add("opacity-50");
        evt.currentTarget.setAttribute("aria-grabbed", "true");
        setState(prev => ({ ...prev, draggedItemId, dragging: true }));
    };

    const moveItem = (arr: string[], i1: string, toIndex: number) => {
        const fromIndex = arr.indexOf(i1);
        if (fromIndex === toIndex) {
            return arr;
        }
        const temp = arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, temp[0]);

        return arr;
    };

    const move = (itemOrder: string[]) => {
        if (!bodyRef.current) return;
        const ulNode = bodyRef.current;
        const nodes = Array.from(ulNode.children);
        if (nodes.map(node => node.id).every((id, i) => id === itemOrder[i])) {
            return;
        }
        while (ulNode.firstChild) {
            ulNode.removeChild(ulNode.lastChild!);
        }

        itemOrder.forEach(id => {
            const node = nodes.find(n => n.id === id);
            if (node) ulNode.appendChild(node);
        });
    };

    const onDragCancel = () => {
        Array.from(bodyRef.current?.children || []).forEach(el => {
            el.classList.remove("opacity-50");
            el.setAttribute("aria-grabbed", "false");
        });
        setState(prev => ({
            ...prev,
            draggedItemId: "",
            draggingToItemIndex: -1,
            dragging: false,
        }));
    };

    const onDragLeave = (evt: ReactDragEvent) => {
        if (!isValidDrop(evt)) {
            move(itemOrder);
            setState(prev => ({ ...prev, draggingToItemIndex: -1 }));
        }
    };

    const isValidDrop = (evt: ReactDragEvent) => {
        if (!bodyRef.current) return false;
        const ulRect = bodyRef.current.getBoundingClientRect();
        return (
            evt.clientX > ulRect.x &&
            evt.clientX < ulRect.x + ulRect.width &&
            evt.clientY > ulRect.y &&
            evt.clientY < ulRect.y + ulRect.height
        );
    };

    const onDrop = (evt: ReactDragEvent) => {
        if (isValidDrop(evt)) {
            onDragFinish(state.draggedItemId, state.tempItemOrder);
        } else {
            onDragCancel();
        }
    };

    const onDragOver = (evt: ReactDragEvent) => {
        evt.preventDefault();

        const td = evt.target as HTMLTableCellElement;
        const curListItem = td.closest("tr");
        if (
            !curListItem ||
            (bodyRef.current && !bodyRef.current.contains(curListItem)) ||
            curListItem.id === state.draggedItemId
        ) {
            return null;
        } else {
            const dragId = curListItem.id;
            const draggingToItemIndex = Array.from(
                bodyRef.current?.children || []
            ).findIndex(item => item.id === dragId);
            if (draggingToItemIndex !== state.draggingToItemIndex) {
                const tempItemOrder = moveItem(
                    itemOrder,
                    state.draggedItemId,
                    draggingToItemIndex
                );
                move(tempItemOrder);

                setState(prev => ({
                    ...prev,
                    draggingToItemIndex,
                    tempItemOrder,
                }));
            }
        }
    };

    const onDragEnd = (evt: ReactDragEvent) => {
        const tr = evt.target as HTMLTableRowElement;
        tr.classList.remove("opacity-50");
        tr.setAttribute("aria-grabbed", "false");
        setState(prev => ({
            ...prev,
            draggedItemId: "",
            draggingToItemIndex: -1,
            dragging: false,
        }));
    };

    return (
        <Table
            aria-label="Draggable table"
            className={cn(
                "text-sm",
                state.dragging && "select-none",
                className
            )}
            {...props}
        >
            <TableHeader>
                <TableRow>
                    <TableHead aria-hidden="true" className="w-10" />
                    {columns.map(column => (
                        <TableHead
                            key={column.name}
                            style={
                                column.width
                                    ? { width: column.width, minWidth: column.width }
                                    : undefined
                            }
                            className="whitespace-nowrap"
                        >
                            {column.thTooltipText ? (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span>{t(column.displayKey || column.name)}</span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {t(column.thTooltipText)}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ) : (
                                t(column.displayKey || column.name)
                            )}
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody
                ref={bodyRef}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onDragLeave={onDragLeave}
            >
                {data.map(row => (
                    <TableRow
                        key={get(row, keyField)}
                        id={get(row, keyField)}
                        draggable
                        onDrop={onDrop}
                        onDragEnd={onDragEnd}
                        onDragStart={onDragStart}
                        className={cn(
                            get(row, keyField) === state.draggedItemId && "opacity-50"
                        )}
                    >
                        <TableCell
                            className="w-10 cursor-grab active:cursor-grabbing"
                            id={`draggable-row-${get(row, keyField)}`}
                        >
                            <DotsSixVertical className="size-4 text-muted-foreground" />
                        </TableCell>
                        {columns.map(column => (
                            <TableCell
                                key={`${get(row, keyField)}_${column.name}`}
                                data-label={column.name}
                            >
                                {column.cellRenderer
                                    ? column.cellRenderer(row)
                                    : get(row, column.name)}
                            </TableCell>
                        ))}
                        {actions && actions.length > 0 && (
                            <TableCell className="w-10">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            aria-label={t("actions")}
                                        >
                                            <DotsThreeVertical className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {actions.map(
                                            ({ isActionable, isDisabled, ...action }, idx) => (
                                                <DropdownMenuItem
                                                    key={idx}
                                                    disabled={
                                                        isDisabled ??
                                                        (isActionable
                                                            ? !isActionable(row)
                                                            : false)
                                                    }
                                                    onClick={e =>
                                                        action.onClick?.(e, row)
                                                    }
                                                >
                                                    {action.title}
                                                </DropdownMenuItem>
                                            )
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
