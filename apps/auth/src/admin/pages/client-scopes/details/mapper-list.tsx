import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import type ClientScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation";
import type ProtocolMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/protocolMapperRepresentation";
import type { ProtocolMapperTypeRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/serverInfoRepesentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
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
import { DotsThree } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerInfo } from "@/admin/app/providers/server-info/server-info-provider";
import { AddMapperDialog } from "../add/mapper-dialog";

type MapperListProps = {
    model: ClientScopeRepresentation | ClientRepresentation;
    onAdd: (
        mappers: ProtocolMapperTypeRepresentation | ProtocolMapperRepresentation[]
    ) => void;
    onDelete: (mapper: ProtocolMapperRepresentation) => void;
    detailLink: (id: string) => string;
};

type Row = ProtocolMapperRepresentation & {
    category: string;
    type: string;
    priority: number;
};

type MapperLinkProps = Row & {
    detailLink: (id: string) => string;
};

const MapperLink = ({ id, name, detailLink }: MapperLinkProps) => (
    <Link to={detailLink(id!)}>{name}</Link>
);

export const MapperList = ({ model, onAdd, onDelete, detailLink }: MapperListProps) => {
    const { t } = useTranslation();

    const mapperList = model.protocolMappers;
    const mapperTypes = useServerInfo().protocolMapperTypes![model.protocol!];

    const [key, setKey] = useState(0);
    useEffect(() => setKey(key + 1), [mapperList]);

    const [addMapperDialogOpen, setAddMapperDialogOpen] = useState(false);
    const [filter, setFilter] = useState(model.protocolMappers);
    const [search, setSearch] = useState("");

    const toggleAddMapperDialog = (buildIn: boolean) => {
        if (buildIn) {
            setFilter(mapperList || []);
        } else {
            setFilter(undefined);
        }
        setAddMapperDialogOpen(!addMapperDialogOpen);
    };

    const rows = useMemo(() => {
        if (!mapperList) return [];
        const list = mapperList.reduce<Row[]>((rows, mapper) => {
            const mapperType = mapperTypes.find(({ id }) => id === mapper.protocolMapper);
            if (!mapperType) return rows;
            return rows.concat({
                ...mapper,
                category: mapperType.category,
                type: mapperType.name,
                priority: mapperType.priority
            });
        }, []);
        return list.sort((a, b) => a.priority - b.priority);
    }, [mapperList, mapperTypes]);

    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    const filteredRows = useMemo(
        () =>
            search
                ? rows.filter(row =>
                      row.name?.toLowerCase().includes(search.toLowerCase())
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

    const colSpan = 5;

    const emptyContent = (
        <Empty className="py-12">
            <EmptyHeader>
                <EmptyTitle>{t("emptyMappers")}</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
                <EmptyDescription>{t("emptyMappersInstructions")}</EmptyDescription>
                <div className="flex gap-2 mt-2 justify-center">
                    <Button
                        variant="secondary"
                        onClick={() => toggleAddMapperDialog(true)}
                    >
                        {t("emptyPrimaryAction")}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => toggleAddMapperDialog(false)}
                    >
                        {t("emptySecondaryAction")}
                    </Button>
                </div>
            </EmptyContent>
        </Empty>
    );

    return (
        <>
            <AddMapperDialog
                protocol={model.protocol!}
                filter={filter}
                onConfirm={onAdd}
                open={addMapperDialogOpen}
                toggleDialog={() => setAddMapperDialogOpen(!addMapperDialogOpen)}
            />

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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button id="mapperAction">{t("addMapper")}</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => toggleAddMapperDialog(true)}>
                                {t("fromPredefinedMapper")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => toggleAddMapperDialog(false)}
                            >
                                {t("byConfiguration")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                {totalCount === 0 && !search ? (
                    emptyContent
                ) : (
                    <Table className="table-fixed">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[25%]">{t("name")}</TableHead>
                                <TableHead className="w-[20%]">{t("category")}</TableHead>
                                <TableHead className="w-[25%]">{t("type")}</TableHead>
                                <TableHead className="w-[15%]">{t("priority")}</TableHead>
                                <TableHead className="w-[10%]" />
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
                                    <TableRow key={row.id ?? row.name}>
                                        <TableCell className="truncate">
                                            <MapperLink {...row} detailLink={detailLink} />
                                        </TableCell>
                                        <TableCell className="truncate">{row.category}</TableCell>
                                        <TableCell className="truncate">{row.type}</TableCell>
                                        <TableCell>{row.priority}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon-sm">
                                                        <DotsThree weight="bold" className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => onDelete(row)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        {t("delete")}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
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
        </>
    );
};
