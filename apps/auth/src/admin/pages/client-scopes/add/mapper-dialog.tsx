import type ProtocolMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/protocolMapperRepresentation";
import type { ProtocolMapperTypeRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/serverInfoRepesentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Checkbox } from "@merge-rd/ui/components/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge-rd/ui/components/dialog";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge-rd/ui/components/empty";
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
import { useEffect, useMemo, useState } from "react";
import { useServerInfo } from "@/admin/app/providers/server-info/server-info-provider";
import { useLocaleSort, mapByKey } from "@/admin/shared/lib/use-locale-sort";

type Row = {
    id: string;
    description: string;
    item: ProtocolMapperRepresentation;
};

type AddMapperDialogModalProps = {
    protocol: string;
    filter?: ProtocolMapperRepresentation[];
    onConfirm: (
        value: ProtocolMapperTypeRepresentation | ProtocolMapperRepresentation[]
    ) => void;
};

type AddMapperDialogProps = AddMapperDialogModalProps & {
    open: boolean;
    toggleDialog: () => void;
};

export const AddMapperDialog = (props: AddMapperDialogProps) => {
    const { t } = useTranslation();

    const serverInfo = useServerInfo();
    const protocol = props.protocol;
    const protocolMappers = serverInfo.protocolMapperTypes![protocol];
    const builtInMappers = serverInfo.builtinProtocolMappers![protocol];
    const [filter, setFilter] = useState<ProtocolMapperRepresentation[]>([]);
    const [selectedRows, setSelectedRows] = useState<Row[]>([]);
    const [search, setSearch] = useState("");
    const localeSort = useLocaleSort();

    const allRows = useMemo(
        () =>
            localeSort(builtInMappers, mapByKey("name")).map(mapper => {
                const mapperType = protocolMappers.find(
                    type => type.id === mapper.protocolMapper
                )!;
                return {
                    item: mapper,
                    id: mapper.name!,
                    description: mapperType.helpText
                };
            }),
        [builtInMappers, protocolMappers]
    );
    const [rows, setRows] = useState(allRows);

    useEffect(() => {
        if (props.filter && props.filter.length !== filter.length) {
            setFilter(props.filter);
            const nameFilter = props.filter.map(f => f.name);
            setRows([...allRows.filter(row => !nameFilter.includes(row.item.name))]);
        }
    }, [props.filter, filter.length, allRows]);

    const sortedProtocolMappers = useMemo(
        () => localeSort(protocolMappers, mapByKey("name")),
        [protocolMappers]
    );

    const isBuiltIn = !!props.filter;

    const header = [t("name"), t("description")];

    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    const filteredRows = useMemo(
        () =>
            search
                ? rows.filter(row =>
                      row.id.toLowerCase().includes(search.toLowerCase())
                  )
                : rows,
        [rows, search]
    );

    const totalCount = filteredRows.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedRows = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredRows.slice(start, start + pageSize);
    }, [filteredRows, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const colSpan = 3;

    return (
        <Dialog
            open={props.open}
            onOpenChange={open => {
                if (!open) props.toggleDialog();
            }}
        >
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>
                        {isBuiltIn
                            ? t("addPredefinedMappers")
                            : t("emptySecondaryAction")}
                    </DialogTitle>
                    <DialogDescription>
                        {isBuiltIn
                            ? t("predefinedMappingDescription")
                            : t("configureMappingDescription")}
                    </DialogDescription>
                </DialogHeader>
                {!isBuiltIn && (
                    <div className="space-y-1">
                        <div className="grid grid-cols-2 gap-2 font-bold border-b pb-2">
                            {header.map(name => (
                                <div key={name}>{name}</div>
                            ))}
                        </div>
                        {sortedProtocolMappers.map(mapper => (
                            <div
                                key={mapper.id}
                                className="grid grid-cols-2 gap-2 py-2 border-b cursor-pointer hover:bg-muted"
                                onClick={() => {
                                    props.onConfirm(mapper!);
                                    props.toggleDialog();
                                }}
                            >
                                <div>{mapper.name}</div>
                                <div>{mapper.helpText}</div>
                            </div>
                        ))}
                    </div>
                )}
                {isBuiltIn && (
                    <div className="flex h-full w-full flex-col">
                        <div className="flex items-center justify-between gap-2 py-2.5">
                            <FacetedFormFilter
                                type="text"
                                size="small"
                                title={t("search")}
                                value={search}
                                onChange={value => setSearch(value)}
                                placeholder={t("searchForMapper")}
                            />
                        </div>

                        {totalCount === 0 && !search ? (
                            <Empty className="py-12">
                                <EmptyHeader>
                                    <EmptyTitle>{t("emptyMappers")}</EmptyTitle>
                                </EmptyHeader>
                                <EmptyContent>
                                    <EmptyDescription>
                                        {t("emptyBuiltInMappersInstructions")}
                                    </EmptyDescription>
                                </EmptyContent>
                            </Empty>
                        ) : (
                            <Table className="table-fixed">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10" />
                                        <TableHead className="w-[40%]">{t("name")}</TableHead>
                                        <TableHead>{t("description")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedRows.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={colSpan}
                                                className="text-center text-muted-foreground"
                                            >
                                                {t("emptyMappers")}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedRows.map(row => (
                                            <TableRow key={row.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedRows.some(
                                                            s => s.id === row.id
                                                        )}
                                                        onCheckedChange={() => {
                                                            setSelectedRows(prev =>
                                                                prev.some(s => s.id === row.id)
                                                                    ? prev.filter(
                                                                          s => s.id !== row.id
                                                                      )
                                                                    : [...prev, row]
                                                            );
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell className="truncate">{row.id}</TableCell>
                                                <TableCell className="truncate">{row.description}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={colSpan} className="p-0">
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
                        )}
                    </div>
                )}
                {isBuiltIn && (
                    <DialogFooter>
                        <Button
                            id="modal-confirm"
                            data-testid="confirm"
                            disabled={rows.length === 0 || selectedRows.length === 0}
                            onClick={() => {
                                props.onConfirm(selectedRows.map(({ item }) => item));
                                props.toggleDialog();
                            }}
                        >
                            {t("add")}
                        </Button>
                        <Button
                            id="modal-cancel"
                            data-testid="cancel"
                            variant="link"
                            onClick={() => {
                                props.toggleDialog();
                            }}
                        >
                            {t("cancel")}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};
