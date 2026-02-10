import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Path } from "react-router-dom";
import { Link } from "react-router-dom";

import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import type ClientScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation";
import type ProtocolMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/protocolMapperRepresentation";
import type { ProtocolMapperTypeRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/serverInfoRepesentation";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";

import { AddMapperDialog } from "../add/MapperDialog";
import { DataTable, DataTableRowActions, type ColumnDef } from "@merge/ui/components/table";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge/ui/components/empty";
import { Button } from "@merge/ui/components/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@merge/ui/components/dropdown-menu";

type MapperListProps = {
    model: ClientScopeRepresentation | ClientRepresentation;
    onAdd: (
        mappers: ProtocolMapperTypeRepresentation | ProtocolMapperRepresentation[]
    ) => void;
    onDelete: (mapper: ProtocolMapperRepresentation) => void;
    detailLink: (id: string) => Partial<Path>;
};

type Row = ProtocolMapperRepresentation & {
    category: string;
    type: string;
    priority: number;
};

type MapperLinkProps = Row & {
    detailLink: (id: string) => Partial<Path>;
};

const MapperLink = ({ id, name, detailLink }: MapperLinkProps) => (
    <Link to={detailLink(id!)}>{name}</Link>
);

export const MapperList = ({ model, onAdd, onDelete, detailLink }: MapperListProps) => {
    const { t } = useTranslation();

    const [_mapperAction, _setMapperAction] = useState(false);
    const mapperList = model.protocolMappers;
    const mapperTypes = useServerInfo().protocolMapperTypes![model.protocol!];

    const [key, setKey] = useState(0);
    useEffect(() => setKey(key + 1), [mapperList]);

    const [addMapperDialogOpen, setAddMapperDialogOpen] = useState(false);
    const [filter, setFilter] = useState(model.protocolMappers);
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

    const columns: ColumnDef<Row>[] = [
        {
            accessorKey: "name",
            header: t("name"),
            cell: ({ row }) => <MapperLink {...row.original} detailLink={detailLink} />
        },
        { accessorKey: "category", header: t("category") },
        { accessorKey: "type", header: t("type") },
        { accessorKey: "priority", header: t("priority") },
        {
            id: "actions",
            cell: ({ row }) => (
                <DataTableRowActions row={row}>
                    <DropdownMenuItem onClick={() => onDelete(row.original)} className="text-destructive">
                        {t("delete")}
                    </DropdownMenuItem>
                </DataTableRowActions>
            )
        }
    ];

    const emptyContent = (
        <Empty className="py-12">
            <EmptyHeader><EmptyTitle>{t("emptyMappers")}</EmptyTitle></EmptyHeader>
            <EmptyContent>
                <EmptyDescription>{t("emptyMappersInstructions")}</EmptyDescription>
                <div className="flex gap-2 mt-2 justify-center">
                    <Button variant="secondary" onClick={() => toggleAddMapperDialog(true)}>{t("emptyPrimaryAction")}</Button>
                    <Button variant="outline" onClick={() => toggleAddMapperDialog(false)}>{t("emptySecondaryAction")}</Button>
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

            <DataTable<Row>
                key={key}
                columns={columns}
                data={rows}
                searchColumnId="name"
                searchPlaceholder={t("searchForMapper")}
                emptyContent={emptyContent}
                emptyMessage={t("emptyMappers")}
                toolbar={
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button id="mapperAction">{t("addMapper")}</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => toggleAddMapperDialog(true)}>{t("fromPredefinedMapper")}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleAddMapperDialog(false)}>{t("byConfiguration")}</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                }
            />
        </>
    );
};
