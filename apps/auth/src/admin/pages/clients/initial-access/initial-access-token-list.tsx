import type ClientInitialAccessPresentation from "@keycloak/keycloak-admin-client/lib/defs/clientInitialAccessPresentation";
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
import { Plus, Trash } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { useDeleteInitialAccessToken } from "../hooks/use-delete-initial-access-token";
import { useFormatDate, FORMAT_DATE_AND_TIME } from "../../../shared/lib/use-format-date";
import { clientKeys } from "../hooks/keys";
import { useInitialAccessTokens } from "../hooks/use-initial-access-tokens";
import { AddInitialAccessTokenDialog } from "./add-initial-access-token-dialog";

export const InitialAccessTokenList = () => {
    const { t } = useTranslation();
    const { realm } = useRealm();
    const formatDate = useFormatDate();

    const queryClient = useQueryClient();
    const { mutateAsync: deleteToken } = useDeleteInitialAccessToken();
    const { data: tokens = [] } = useInitialAccessTokens();
    const [token, setToken] = useState<ClientInitialAccessPresentation>();
    const invalidateTokens = () =>
        queryClient.invalidateQueries({ queryKey: clientKeys.initialAccessTokens() });

    const onDeleteConfirm = async () => {
        if (!token?.id) return;
        try {
            await deleteToken(token.id);
            toast.success(t("tokenDeleteSuccess"));
            setToken(undefined);
        } catch (error) {
            toast.error(t("tokenDeleteError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const columns: ColumnDef<ClientInitialAccessPresentation>[] = [
        {
            accessorKey: "id",
            header: t("id"),
            cell: ({ row }) => row.original.id || "-"
        },
        {
            accessorKey: "timestamp",
            header: t("timestamp"),
            cell: ({ row }) =>
                formatDate(new Date(row.original.timestamp! * 1000), FORMAT_DATE_AND_TIME)
        },
        {
            id: "expiration",
            header: t("expires"),
            cell: ({ row }) =>
                formatDate(
                    new Date(
                        row.original.timestamp! * 1000 + row.original.expiration! * 1000
                    ),
                    FORMAT_DATE_AND_TIME
                )
        },
        {
            accessorKey: "count",
            header: t("count"),
            cell: ({ row }) => row.original.count ?? "-"
        },
        {
            accessorKey: "remainingCount",
            header: t("remainingCount"),
            cell: ({ row }) => row.original.remainingCount ?? "-"
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
                        className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setToken(row.original)}
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
            <AlertDialog
                open={!!token}
                onOpenChange={open => !open && setToken(undefined)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("tokenDeleteConfirmTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("tokenDeleteConfirm", { id: token?.id })}
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
            <DataTable
                columns={columns}
                data={tokens}
                searchColumnId="id"
                searchPlaceholder={t("searchInitialAccessToken")}
                emptyMessage={t("noTokens")}
                toolbar={
                    <AddInitialAccessTokenDialog
                        onSuccess={() => invalidateTokens()}
                        trigger={
                            <Button
                                type="button"
                                data-testid="createInitialAccessToken"
                                variant="default"
                                className="flex h-9 w-9 shrink-0 items-center justify-center p-0 sm:h-9 sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
                                aria-label={t("createToken")}
                            >
                                <Plus size={20} className="shrink-0 sm:hidden" />
                                <span className="hidden sm:inline">
                                    {t("createToken")}
                                </span>
                            </Button>
                        }
                    />
                }
            />
        </>
    );
};
