import { useTranslation } from "@merge-rd/i18n";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@merge-rd/ui/components/alert-dialog";
import { Button } from "@merge-rd/ui/components/button";
import { PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import {
    type ColumnDef,
    DataTable,
    DataTableRowActions
} from "@/admin/shared/ui/data-table";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { useLocaleSort, mapByKey } from "../../shared/lib/use-locale-sort";
import { useDeleteClientScope } from "./hooks/use-delete-client-scope";
import {
    type AllClientScopeType,
    CellDropdown,
    type ClientScopeDefaultOptionalType,
    changeScope
} from "../../shared/ui/client-scope/client-scope-types";
import type { Row } from "../clients/scopes/client-scopes";
import { getProtocolName } from "../clients/utils";
import { AddClientScopeDialog } from "./add-client-scope-dialog";
import { useClientScopes } from "./hooks/use-client-scopes";
import { EditClientScopeDialog } from "./edit-client-scope-dialog";

type TypeSelectorProps = ClientScopeDefaultOptionalType & {
    refresh: () => void;
    className?: string;
};

function TypeSelector(scope: TypeSelectorProps) {
    const { t } = useTranslation();
    return (
        <CellDropdown
            clientScope={scope}
            type={scope.type}
            all
            className={scope.className}
            onSelect={async value => {
                try {
                    await changeScope(scope, value as AllClientScopeType);
                    toast.success(t("clientScopeSuccess"));
                    scope.refresh();
                } catch (error) {
                    toast.error(
                        t("clientScopeError", { error: getErrorMessage(error) }),
                        {
                            description: getErrorDescription(error)
                        }
                    );
                }
            }}
        />
    );
}

export function ClientScopesSection() {
    const { t } = useTranslation();
    const localeSort = useLocaleSort();

    const { data: rawClientScopes = [], refetch: refetchScopes } = useClientScopes();
    const clientScopes = localeSort(rawClientScopes as Row[], mapByKey("name"));
    const refresh = () => {
        refetchScopes();
    };
    const [selectedScope, setSelectedScope] = useState<ClientScopeDefaultOptionalType>();
    const [editScopeId, setEditScopeId] = useState<string | null>(null);

    const { mutateAsync: deleteScope } = useDeleteClientScope();

    const onDeleteConfirm = async () => {
        if (!selectedScope?.id) return;
        const currentCount = clientScopes.length;
        if (currentCount <= 1) {
            toast.error(t("notAllowedToDeleteAllClientScopes"));
            setSelectedScope(undefined);
            return;
        }
        try {
            await deleteScope(selectedScope);
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
            accessorFn: row => row.attributes?.["gui.order"],
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
        <div className="pt-4 pb-6 px-0">
            <AlertDialog
                open={!!selectedScope}
                onOpenChange={open => !open && setSelectedScope(undefined)}
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
                onOpenChange={open => !open && setEditScopeId(null)}
                scopeId={editScopeId}
                onSuccess={refresh}
            />

            <DataTable
                columns={columns}
                data={clientScopes}
                searchColumnId="name"
                searchPlaceholder={t("searchForClientScope")}
                emptyMessage={t("emptyClientScopes")}
                onRowClick={row => setEditScopeId(row.original.id!)}
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
                                <span className="hidden sm:inline">
                                    {t("createClientScope")}
                                </span>
                            </Button>
                        }
                        onSuccess={refresh}
                    />
                }
            />
        </div>
    );
}
