/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/client-scopes/details/MapperList.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Path } from "react-router-dom";
import { Link } from "react-router-dom";

import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import type ClientScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation";
import type ProtocolMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/protocolMapperRepresentation";
import type { ProtocolMapperTypeRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/serverInfoRepesentation";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";

import { ListEmptyState } from "../../../shared/keycloak-ui-shared";
import { AddMapperDialog } from "../add/MapperDialog";
import { Action, KeycloakDataTable } from "../../../shared/keycloak-ui-shared";
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

    const [mapperAction, setMapperAction] = useState(false);
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

    const loader = async () => {
        if (!mapperList) {
            return [];
        }

        const list = mapperList.reduce<Row[]>((rows, mapper) => {
            const mapperType = mapperTypes.find(({ id }) => id === mapper.protocolMapper);

            if (!mapperType) {
                return rows;
            }

            return rows.concat({
                ...mapper,
                category: mapperType.category,
                type: mapperType.name,
                priority: mapperType.priority
            });
        }, []);

        return list.sort((a, b) => a.priority - b.priority);
    };

    return (
        <>
            <AddMapperDialog
                protocol={model.protocol!}
                filter={filter}
                onConfirm={onAdd}
                open={addMapperDialogOpen}
                toggleDialog={() => setAddMapperDialogOpen(!addMapperDialogOpen)}
            />

            <KeycloakDataTable
                key={key}
                loader={loader}
                ariaLabelKey="clientScopeList"
                searchPlaceholderKey="searchForMapper"
                toolbarItem={
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button id="mapperAction">
                                {t("addMapper")}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => toggleAddMapperDialog(true)}>
                                {t("fromPredefinedMapper")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleAddMapperDialog(false)}>
                                {t("byConfiguration")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                }
                actions={[
                    {
                        title: t("delete"),
                        onRowClick: onDelete
                    } as Action<Row>
                ]}
                columns={[
                    {
                        name: "name",
                        cellRenderer: row => (
                            <MapperLink {...row} detailLink={detailLink} />
                        )
                    },
                    { name: "category" },
                    {
                        name: "type"
                    },
                    {
                        name: "priority"
                    }
                ]}
                emptyState={
                    <ListEmptyState
                        message={t("emptyMappers")}
                        instructions={t("emptyMappersInstructions")}
                        secondaryActions={[
                            {
                                text: t("emptyPrimaryAction"),
                                onClick: () => toggleAddMapperDialog(true)
                            },
                            {
                                text: t("emptySecondaryAction"),
                                onClick: () => toggleAddMapperDialog(false)
                            }
                        ]}
                    />
                }
            />
        </>
    );
};
