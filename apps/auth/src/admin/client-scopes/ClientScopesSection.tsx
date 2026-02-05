import { Button } from "@merge/ui/components/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@merge/ui/components/alert-dialog";
import {
    DataTable,
    DataTableRowActions,
    type ColumnDef
} from "@merge/ui/components/table";
import { PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import type { Row } from "../clients/scopes/ClientScopes";
import { getProtocolName } from "../clients/utils";
import { getErrorDescription, getErrorMessage } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import {
    AllClientScopeType,
    AllClientScopes,
    CellDropdown,
    ClientScope,
    ClientScopeDefaultOptionalType,
    changeScope,
    removeScope
} from "../components/client-scope/ClientScopeTypes";
import { ViewHeader } from "../components/view-header/ViewHeader";
import helpUrls from "../help-urls";
import useLocaleSort, { mapByKey } from "../utils/useLocaleSort";
import { useFetch } from "../../shared/keycloak-ui-shared";
import { AddClientScopeDialog } from "./AddClientScopeDialog";
import { EditClientScopeDialog } from "./EditClientScopeDialog";

type TypeSelectorProps = ClientScopeDefaultOptionalType & {
    refresh: () => void;
    className?: string;
};

function TypeSelector(scope: TypeSelectorProps) {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    return (
        <CellDropdown
            clientScope={scope}
            type={scope.type}
            all
            className={scope.className}
            onSelect={async (value) => {
                try {
                    await changeScope(adminClient, scope, value as AllClientScopeType);
                    toast.success(t("clientScopeSuccess"));
                    scope.refresh();
                } catch (error) {
                    toast.error(t("clientScopeError", { error: getErrorMessage(error) }), {
                        description: getErrorDescription(error)
                    });
                }
            }}
        />
    );
}

export default function ClientScopesSection() {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const localeSort = useLocaleSort();

    const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);
    const [clientScopes, setClientScopes] = useState<Row[]>([]);
    const [selectedScope, setSelectedScope] = useState<ClientScopeDefaultOptionalType>();
    const [editScopeId, setEditScopeId] = useState<string | null>(null);

    useFetch(
        async () => {
            const [defaultScopes, optionalScopes, scopes] = await Promise.all([
                adminClient.clientScopes.listDefaultClientScopes(),
                adminClient.clientScopes.listDefaultOptionalClientScopes(),
                adminClient.clientScopes.find()
            ]);
            const transformed: Row[] = scopes.map(scope => ({
                ...scope,
                type: defaultScopes.find(s => s.name === scope.name)
                    ? ClientScope.default
                    : optionalScopes.find(s => s.name === scope.name)
                      ? ClientScope.optional
                      : AllClientScopes.none
            }));
            return localeSort(transformed, mapByKey("name"));
        },
        (data) => setClientScopes(data),
        [key]
    );

    const onDeleteConfirm = async () => {
        if (!selectedScope?.id) return;
        const currentCount = clientScopes.length;
        if (currentCount <= 1) {
            toast.error(t("notAllowedToDeleteAllClientScopes"));
            setSelectedScope(undefined);
            return;
        }
        try {
            await removeScope(adminClient, selectedScope);
            await adminClient.clientScopes.del({ id: selectedScope.id });
            toast.success(t("deletedSuccessClientScope"));
            setSelectedScope(undefined);
            refresh();
        } catch (error) {
            toast.error(t("deleteErrorClientScope", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const columns: ColumnDef<Row>[] = [
        {
            accessorKey: "name",
            header: t("name"),
            cell: ({ row }) => (
                <button
                    type="button"
                    className="text-primary hover:underline text-left"
                    onClick={() => setEditScopeId(row.original.id!)}
                >
                    {row.original.name}
                </button>
            )
        },
        {
            accessorKey: "type",
            header: t("assignedType"),
            cell: ({ row }) => (
                <TypeSelector
                    {...row.original}
                    refresh={refresh}
                    className="h-8 min-h-8 w-auto min-w-[100px] border border-input bg-muted/50 py-1 px-2 text-sm"
                />
            )
        },
        {
            accessorKey: "protocol",
            header: t("protocol"),
            cell: ({ row }) =>
                getProtocolName(t, row.original.protocol ?? "openid-connect")
        },
        {
            id: "displayOrder",
            accessorFn: (row) => row.attributes?.["gui.order"],
            header: t("displayOrder"),
            cell: ({ row }) => row.original.attributes?.["gui.order"] ?? "-"
        },
        {
            accessorKey: "description",
            header: t("description"),
            cell: ({ row }) => row.original.description || "-"
        },
        {
            id: "actions",
            header: "",
            size: 50,
            enableHiding: false,
            cell: ({ row }) => (
                <DataTableRowActions row={row}>
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                        onClick={() => setEditScopeId(row.original.id!)}
                    >
                        <PencilSimple className="size-4 shrink-0" />
                        {t("edit")}
                    </button>
                    <div className="my-1 h-px bg-border" />
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setSelectedScope(row.original)}
                    >
                        <Trash className="size-4 shrink-0" />
                        {t("delete")}
                    </button>
                </DataTableRowActions>
            )
        }
    ];

    return (
        <>
            <ViewHeader
                titleKey="clientScopes"
                subKey="clientScopeExplain"
                helpUrl={helpUrls.clientScopesUrl}
                divider
            />
            <div className="py-6 px-0">
                <AlertDialog
                    open={!!selectedScope}
                    onOpenChange={(open) => !open && setSelectedScope(undefined)}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {t("deleteClientScope", {
                                    count: 1,
                                    name: selectedScope?.name
                                })}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {t("deleteConfirmClientScopes")}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                                variant="destructive"
                                data-testid="confirm"
                                onClick={onDeleteConfirm}
                            >
                                {t("delete")}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <EditClientScopeDialog
                    open={!!editScopeId}
                    onOpenChange={(open) => !open && setEditScopeId(null)}
                    scopeId={editScopeId}
                    onSuccess={refresh}
                />

                <DataTable
                    key={key}
                    columns={columns}
                    data={clientScopes}
                    searchColumnId="name"
                    searchPlaceholder={t("searchForClientScope")}
                    emptyMessage={t("emptyClientScopes")}
                    onRowClick={(row) => setEditScopeId(row.original.id!)}
                    toolbar={
                        <AddClientScopeDialog
                            trigger={
                                <Button
                                    type="button"
                                    data-testid="createClientScope"
                                    variant="default"
                                    className="flex h-9 w-9 shrink-0 items-center justify-center p-0 sm:h-9 sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
                                    aria-label={t("createClientScope")}
                                >
                                    <Plus size={20} className="shrink-0 sm:hidden" />
                                    <span className="hidden sm:inline">{t("createClientScope")}</span>
                                </Button>
                            }
                            onSuccess={refresh}
                        />
                    }
                />
            </div>
        </>
    );
}
