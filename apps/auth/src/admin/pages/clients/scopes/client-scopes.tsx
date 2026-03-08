import type ClientScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { DotsThreeVertical } from "@phosphor-icons/react";
import { Link, type LinkProps } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
    type ColumnDef,
    DataTable,
    DataTableRowActions
} from "@/admin/shared/ui/data-table";
import {
    getErrorDescription,
    getErrorMessage
} from "../../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../../app/admin-client";
import { useClientAssignedScopes } from "../api/use-client-assigned-scopes";

const RouterLink = Link as ComponentType<LinkProps>;

import { useAccess } from "../../../app/providers/access/access";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { translationFormatter } from "../../../shared/lib/translationFormatter";
import useIsFeatureEnabled, { Feature } from "../../../shared/lib/useIsFeatureEnabled";
import useLocaleSort, { mapByKey } from "../../../shared/lib/useLocaleSort";
import {
    AllClientScopes,
    type AllClientScopeType,
    addClientScope,
    CellDropdown,
    ClientScope,
    changeClientScope,
    removeClientScope
} from "../../../shared/ui/client-scope/client-scope-types";
import { useConfirmDialog } from "../../../shared/ui/confirm-dialog/confirm-dialog";
import { ChangeTypeDropdown } from "../../client-scopes/change-type-dropdown";
import { PROTOCOL_OID4VC, PROTOCOL_OIDC } from "../constants";
import { toDedicatedScope } from "../../../shared/lib/routes/clients";
import { AddScopeDialog } from "./add-scope-dialog";

type ClientScopesProps = {
    clientId: string;
    protocol: string;
    clientName: string;
    fineGrainedAccess?: boolean;
};

export type Row = ClientScopeRepresentation & {
    type: AllClientScopeType;
    description?: string;
};

const DEDICATED_ROW = "dedicated";

type TypeSelectorProps = Row & {
    clientId: string;
    fineGrainedAccess?: boolean;
    refresh: () => void;
};

const TypeSelector = ({
    clientId,
    refresh,
    fineGrainedAccess,
    ...scope
}: TypeSelectorProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { hasAccess } = useAccess();

    const isDedicatedRow = (value: Row) => value.id === DEDICATED_ROW;
    const isManager = hasAccess("manage-clients") || fineGrainedAccess;

    return (
        <CellDropdown
            isDisabled={isDedicatedRow(scope) || !isManager}
            clientScope={scope}
            type={scope.type}
            onSelect={async value => {
                try {
                    await changeClientScope(
                        adminClient,
                        clientId,
                        scope,
                        scope.type,
                        value as ClientScope
                    );
                    toast.success(t("clientScopeSuccess"));
                    refresh();
                } catch (error) {
                    toast.error(
                        t("clientScopeError", { error: getErrorMessage(error) }),
                        { description: getErrorDescription(error) }
                    );
                }
            }}
        />
    );
};

export const ClientScopes = ({
    clientId,
    protocol,
    clientName,
    fineGrainedAccess
}: ClientScopesProps) => {
    const { adminClient } = useAdminClient();
    const isFeatureEnabled = useIsFeatureEnabled();

    const { t } = useTranslation();
    const { realm } = useRealm();
    const localeSort = useLocaleSort();

    const [addDialogOpen, setAddDialogOpen] = useState(false);

    const [rows, setRows] = useState<Row[]>([]);
    const [rest, setRest] = useState<ClientScopeRepresentation[]>();
    const [selectedRows, setSelectedRowState] = useState<Row[]>([]);
    const setSelectedRows = (rows: Row[]) =>
        setSelectedRowState(rows.filter(({ id }) => id !== DEDICATED_ROW));
    const [kebabOpen, setKebabOpen] = useState(false);

    const isDedicatedRow = (value: Row) => value.id === DEDICATED_ROW;

    const { hasAccess } = useAccess();
    const isManager = hasAccess("manage-clients") || fineGrainedAccess;
    const isViewer = hasAccess("view-clients") || fineGrainedAccess;

    const { data: assignedScopesData, refetch } = useClientAssignedScopes(clientId);
    const refresh = () => {
        refetch();
    };

    useEffect(() => {
        if (!assignedScopesData) return;
        const { defaultClientScopes, optionalClientScopes, clientScopes } =
            assignedScopesData;

        const find = (id: string) =>
            clientScopes.find(clientScope => id === clientScope.id);

        const optional = optionalClientScopes.map(c => {
            const scope = find(c.id!);
            const row: Row = {
                ...c,
                type: ClientScope.optional,
                description: scope?.description
            };
            return row;
        });

        const defaultScopes = defaultClientScopes.map(c => {
            const scope = find(c.id!);
            const row: Row = {
                ...c,
                type: ClientScope.default,
                description: scope?.description
            };
            return row;
        });

        let resultRows = [...optional, ...defaultScopes];
        const names = resultRows.map(row => row.name);

        const allowedProtocols = (() => {
            if (protocol === PROTOCOL_OIDC) {
                return isFeatureEnabled(Feature.OpenId4VCI)
                    ? [PROTOCOL_OIDC, PROTOCOL_OID4VC]
                    : [PROTOCOL_OIDC];
            }
            return [protocol];
        })();

        const restScopes = clientScopes
            .filter(scope => !names.includes(scope.name))
            .filter(scope => scope.protocol && allowedProtocols.includes(scope.protocol));

        resultRows = localeSort(resultRows, mapByKey("name"));

        if (isViewer) {
            resultRows.unshift({
                id: DEDICATED_ROW,
                name: t("dedicatedScopeName", { clientName }),
                type: AllClientScopes.none,
                description: t("dedicatedScopeDescription")
            });
        }

        setRows(resultRows);
        setRest(restScopes);
    }, [assignedScopesData]);

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: t("deleteClientScope", {
            count: selectedRows.length,
            name: selectedRows[0]?.name
        }),
        messageKey: "deleteConfirmClientScopes",
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await removeClientScope(
                    adminClient,
                    clientId,
                    selectedRows[0],
                    selectedRows[0].type as ClientScope
                );
                toast.success(t("clientScopeRemoveSuccess"));
                refresh();
            } catch (error) {
                toast.error(
                    t("clientScopeRemoveError", { error: getErrorMessage(error) }),
                    { description: getErrorDescription(error) }
                );
            }
        }
    });

    const columns: ColumnDef<Row>[] = [
        {
            accessorKey: "name",
            header: t("assignedClientScope"),
            cell: ({ row }) => {
                if (isDedicatedRow(row.original)) {
                    return (
                        <RouterLink
                            className="text-primary hover:underline"
                            to={toDedicatedScope({ realm, clientId }) as string}
                        >
                            {row.original.name}
                        </RouterLink>
                    );
                }
                return row.original.name!;
            }
        },
        {
            accessorKey: "type",
            header: t("assignedType"),
            cell: ({ row }) => (
                <TypeSelector
                    clientId={clientId}
                    refresh={refresh}
                    fineGrainedAccess={fineGrainedAccess}
                    {...row.original}
                />
            )
        },
        {
            accessorKey: "description",
            header: t("description"),
            cell: ({ row }) =>
                (translationFormatter(t)(row.original.description) as string) || "-"
        },
        {
            id: "actions",
            header: "",
            size: 50,
            enableHiding: false,
            cell: ({ row }) => {
                if (isDedicatedRow(row.original) || !isManager) return null;
                return (
                    <DataTableRowActions row={row}>
                        <button
                            type="button"
                            className="w-full rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => {
                                setSelectedRows([row.original]);
                                toggleDeleteDialog();
                            }}
                        >
                            {t("remove")}
                        </button>
                    </DataTableRowActions>
                );
            }
        }
    ];

    return (
        <div className="p-6">
            {rest && (
                <AddScopeDialog
                    clientScopes={rest}
                    clientName={clientName!}
                    open={addDialogOpen}
                    toggleDialog={() => setAddDialogOpen(!addDialogOpen)}
                    onAdd={async scopes => {
                        try {
                            await Promise.all(
                                scopes.map(
                                    async scope =>
                                        await addClientScope(
                                            adminClient,
                                            clientId,
                                            scope.scope,
                                            scope.type!
                                        )
                                )
                            );
                            toast.success(t("clientScopeSuccess"));
                            refresh();
                        } catch (error) {
                            toast.error(
                                t("clientScopeError", { error: getErrorMessage(error) }),
                                { description: getErrorDescription(error) }
                            );
                        }
                    }}
                />
            )}
            <DeleteConfirm />
            <DataTable
                columns={columns}
                data={rows}
                searchColumnId="name"
                searchPlaceholder={t("searchByName")}
                emptyMessage={t("emptyClientScopes")}
                toolbar={
                    isManager ? (
                        <div className="flex gap-2">
                            <Button onClick={() => setAddDialogOpen(true)}>
                                {t("addClientScope")}
                            </Button>
                            <ChangeTypeDropdown
                                clientId={clientId}
                                selectedRows={selectedRows}
                                refresh={refresh}
                            />
                            <DropdownMenu open={kebabOpen} onOpenChange={setKebabOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        data-testid="kebab"
                                        aria-label="Kebab toggle"
                                        variant="ghost"
                                        size="icon"
                                    >
                                        <DotsThreeVertical className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        key="deleteAll"
                                        disabled={selectedRows.length === 0}
                                        onClick={async () => {
                                            try {
                                                await Promise.all(
                                                    selectedRows.map(row =>
                                                        removeClientScope(
                                                            adminClient,
                                                            clientId,
                                                            { ...row },
                                                            row.type as ClientScope
                                                        )
                                                    )
                                                );

                                                setKebabOpen(false);
                                                setSelectedRows([]);
                                                toast.success(
                                                    t("clientScopeRemoveSuccess")
                                                );
                                                refresh();
                                            } catch (error) {
                                                toast.error(
                                                    t("clientScopeRemoveError", {
                                                        error: getErrorMessage(error)
                                                    }),
                                                    {
                                                        description:
                                                            getErrorDescription(error)
                                                    }
                                                );
                                            }
                                        }}
                                    >
                                        {t("remove")}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : undefined
                }
            />
        </div>
    );
};
