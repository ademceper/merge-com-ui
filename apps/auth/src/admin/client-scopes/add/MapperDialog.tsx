/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/client-scopes/add/MapperDialog.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@merge/ui/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@merge/ui/components/dialog";

import type ProtocolMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/protocolMapperRepresentation";
import type { ProtocolMapperTypeRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/serverInfoRepesentation";

import { useServerInfo } from "../../context/server-info/ServerInfoProvider";
import { ListEmptyState } from "../../../shared/keycloak-ui-shared";
import { KeycloakDataTable } from "../../../shared/keycloak-ui-shared";
import useLocaleSort, { mapByKey } from "../../utils/useLocaleSort";

type Row = {
    id: string;
    description: string;
    item: ProtocolMapperRepresentation;
};

export type AddMapperDialogModalProps = {
    protocol: string;
    filter?: ProtocolMapperRepresentation[];
    onConfirm: (
        value: ProtocolMapperTypeRepresentation | ProtocolMapperRepresentation[]
    ) => void;
};

export type AddMapperDialogProps = AddMapperDialogModalProps & {
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

    if (props.filter && props.filter.length !== filter.length) {
        setFilter(props.filter);
        const nameFilter = props.filter.map(f => f.name);
        setRows([...allRows.filter(row => !nameFilter.includes(row.item.name))]);
    }

    const sortedProtocolMappers = useMemo(
        () => localeSort(protocolMappers, mapByKey("name")),
        [protocolMappers]
    );

    const isBuiltIn = !!props.filter;

    const header = [t("name"), t("description")];

    return (
        <Dialog open={props.open} onOpenChange={open => { if (!open) props.toggleDialog(); }}>
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
                    <KeycloakDataTable
                        loader={rows}
                        onSelect={setSelectedRows}
                        canSelectAll
                        ariaLabelKey="addPredefinedMappers"
                        searchPlaceholderKey="searchForMapper"
                        columns={[
                            {
                                name: "id",
                                displayKey: "name"
                            },
                            {
                                name: "description",
                                displayKey: "description"
                            }
                        ]}
                        emptyState={
                            <ListEmptyState
                                message={t("emptyMappers")}
                                instructions={t("emptyBuiltInMappersInstructions")}
                            />
                        }
                    />
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
