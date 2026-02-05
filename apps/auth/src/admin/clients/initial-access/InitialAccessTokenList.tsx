import type ClientInitialAccessPresentation from "@keycloak/keycloak-admin-client/lib/defs/clientInitialAccessPresentation";
import { useFetch, getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
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
import { Plus, Trash } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { useRealm } from "../../context/realm-context/RealmContext";
import useFormatDate, { FORMAT_DATE_AND_TIME } from "../../utils/useFormatDate";
import { AddInitialAccessTokenDialog } from "./AddInitialAccessTokenDialog";

export const InitialAccessTokenList = () => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const { realm } = useRealm();
    const formatDate = useFormatDate();

    const [tokens, setTokens] = useState<ClientInitialAccessPresentation[]>([]);
    const [token, setToken] = useState<ClientInitialAccessPresentation>();
    const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);

    useFetch(
        async () => {
            try {
                return await adminClient.realms.getClientsInitialAccess({ realm });
            } catch {
                return [];
            }
        },
        (data) => setTokens(data),
        [key]
    );

    const onDeleteConfirm = async () => {
        if (!token?.id) return;
        try {
            await adminClient.realms.delClientsInitialAccess({ realm, id: token.id });
            toast.success(t("tokenDeleteSuccess"));
            setToken(undefined);
            refresh();
        } catch (error) {
            toast.error(t("tokenDeleteError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
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
                formatDate(
                    new Date(row.original.timestamp! * 1000),
                    FORMAT_DATE_AND_TIME
                )
        },
        {
            id: "expiration",
            header: t("expires"),
            cell: ({ row }) =>
                formatDate(
                    new Date(row.original.timestamp! * 1000 + row.original.expiration! * 1000),
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
            <AlertDialog open={!!token} onOpenChange={(open) => !open && setToken(undefined)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("tokenDeleteConfirmTitle")}</AlertDialogTitle>
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
                key={key}
                columns={columns}
                data={tokens}
                searchColumnId="id"
                searchPlaceholder={t("searchInitialAccessToken")}
                emptyMessage={t("noTokens")}
                toolbar={
                    <AddInitialAccessTokenDialog
                        onSuccess={refresh}
                        trigger={
                            <Button
                                type="button"
                                data-testid="createInitialAccessToken"
                                variant="default"
                                className="flex h-9 w-9 shrink-0 items-center justify-center p-0 sm:h-9 sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
                                aria-label={t("createToken")}
                            >
                                <Plus size={20} className="shrink-0 sm:hidden" />
                                <span className="hidden sm:inline">{t("createToken")}</span>
                            </Button>
                        }
                    />
                }
            />
        </>
    );
};
