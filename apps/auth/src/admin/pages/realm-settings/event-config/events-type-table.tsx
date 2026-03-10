import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TablePaginationFooter,
    TableRow
} from "@merge-rd/ui/components/table";
import { DotsThree, Trash } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

export type EventType = {
    id: string;
};

type EventTypeRow = EventType & {
    name: string;
    description: string;
};

type EventsTypeTableProps = {
    ariaLabelKey?: string;
    eventTypes: string[];
    addTypes?: () => void;
    onSelect?: (value: EventType[]) => void;
    onDelete?: (value: EventType) => void;
    onDeleteAll?: (value: EventType[]) => void;
};

export function EventsTypeTable({
    eventTypes,
    addTypes,
    onDelete
}: EventsTypeTableProps) {
    const { t } = useTranslation();

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const data: EventTypeRow[] = useMemo(
        () =>
            eventTypes.map(type => ({
                id: type,
                name: t(`eventTypes.${type}.name`),
                description: t(`eventTypes.${type}.description`)
            })),
        [eventTypes, t]
    );

    const filteredData = useMemo(() => {
        if (!search) return data;
        const lower = search.toLowerCase();
        return data.filter(d => d.name.toLowerCase().includes(lower));
    }, [data, search]);

    const totalCount = filteredData.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedData = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage, pageSize]);

    return (
        <div className="flex h-full w-full flex-col">
            <div className="flex items-center justify-between gap-2 py-2.5">
                <FacetedFormFilter
                    type="text"
                    size="small"
                    title={t("search")}
                    value={search}
                    onChange={value => setSearch(value)}
                    placeholder={t("searchEventType")}
                />
                {addTypes && (
                    <Button
                        type="button"
                        id="addTypes"
                        onClick={addTypes}
                        data-testid="addTypes"
                        variant="default"
                        className="flex h-9 w-9 shrink-0 items-center justify-center p-0 sm:h-9 sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
                        aria-label={t("addSavedTypes")}
                    >
                        {t("addSavedTypes")}
                    </Button>
                )}
            </div>

            <Table className="table-fixed">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[35%]">{t("eventType")}</TableHead>
                        <TableHead className="w-[55%]">{t("description")}</TableHead>
                        {onDelete && <TableHead className="w-[10%]" />}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedData.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={onDelete ? 3 : 2}
                                className="text-center text-muted-foreground"
                            >
                                {t("emptyEvents")}
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedData.map(row => (
                            <TableRow key={row.id}>
                                <TableCell className="truncate">
                                    {row.name}
                                </TableCell>
                                <TableCell className="truncate">
                                    {row.description ?? "-"}
                                </TableCell>
                                {onDelete && (
                                    <TableCell onClick={e => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon-sm">
                                                    <DotsThree
                                                        weight="bold"
                                                        className="size-4"
                                                    />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => onDelete({ id: row.id })}
                                                >
                                                    <Trash className="size-4" />
                                                    {t("remove")}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))
                    )}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={onDelete ? 3 : 2} className="p-0">
                            <TablePaginationFooter
                                pageSize={pageSize}
                                onPageSizeChange={setPageSize}
                                onPreviousPage={() =>
                                    setCurrentPage(p => Math.max(0, p - 1))
                                }
                                onNextPage={() =>
                                    setCurrentPage(p =>
                                        Math.min(totalPages - 1, p + 1)
                                    )
                                }
                                hasPreviousPage={currentPage > 0}
                                hasNextPage={currentPage < totalPages - 1}
                                totalCount={totalCount}
                            />
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    );
}
