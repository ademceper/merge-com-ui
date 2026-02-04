import type ClientInitialAccessPresentation from "@keycloak/keycloak-admin-client/lib/defs/clientInitialAccessPresentation";
import { useFetch } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import {
    DataTable,
    DataTableRowActions,
    type ColumnDef
} from "@merge/ui/components/table";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { useRealm } from "../../context/realm-context/RealmContext";
import useFormatDate, { FORMAT_DATE_AND_TIME } from "../../utils/useFormatDate";
import { toCreateInitialAccessToken } from "../routes/CreateInitialAccessToken";

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

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "tokenDeleteConfirmTitle",
        messageKey: t("tokenDeleteConfirm", { id: token?.id }),
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await adminClient.realms.delClientsInitialAccess({
                    realm,
                    id: token!.id!
                });
                toast.success(t("tokenDeleteSuccess"));
                setToken(undefined);
                refresh();
            } catch (error) {
                toast.error(t("tokenDeleteError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        }
    });

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
                        className="w-full rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => {
                            setToken(row.original);
                            toggleDeleteDialog();
                        }}
                    >
                        {t("delete")}
                    </button>
                </DataTableRowActions>
            )
        }
    ];

    return (
        <div className="p-6">
            <DeleteConfirm />
            <DataTable
                key={key}
                columns={columns}
                data={tokens}
                searchColumnId="id"
                searchPlaceholder={t("searchInitialAccessToken")}
                emptyMessage={t("noTokens")}
                toolbar={
                    <Button asChild>
                        <Link to={toCreateInitialAccessToken({ realm })}>
                            {t("create")}
                        </Link>
                    </Button>
                }
            />
        </div>
    );
};
