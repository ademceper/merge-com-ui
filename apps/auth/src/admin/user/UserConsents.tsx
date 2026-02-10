import type UserConsentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userConsentRepresentation";
import { Badge } from "@merge/ui/components/badge";
import { Cube, Trash } from "@phosphor-icons/react";
import { sortBy } from "lodash-es";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { getErrorDescription, getErrorMessage, useFetch } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { DataTable, DataTableRowActions, type ColumnDef } from "@merge/ui/components/table";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle
} from "@merge/ui/components/empty";
import { DropdownMenuItem } from "@merge/ui/components/dropdown-menu";
import useFormatDate from "../utils/useFormatDate";
import { useParams } from "../utils/useParams";

export const UserConsents = () => {
    const { adminClient } = useAdminClient();

    const [selectedClient, setSelectedClient] = useState<UserConsentRepresentation>();
    const { t } = useTranslation();
const formatDate = useFormatDate();
    const [key, setKey] = useState(0);

    const { id } = useParams<{ id: string }>();
    const alphabetize = (consentsList: UserConsentRepresentation[]) => {
        return sortBy(consentsList, client => client.clientId?.toUpperCase());
    };

    const refresh = () => setKey(new Date().getTime());

    const [consents, setConsents] = useState<UserConsentRepresentation[]>([]);
    useFetch(
        async () => alphabetize(await adminClient.users.listConsents({ id })),
        setConsents,
        [key, id]
    );

    const clientScopesRenderer = ({ grantedClientScopes }: UserConsentRepresentation) => {
        return (
            <div className="flex gap-1 flex-wrap kc-consents-chip-group">
                {grantedClientScopes!.map(currentChip => (
                    <Badge key={currentChip} variant="secondary" className="kc-consents-chip">
                        {currentChip}
                    </Badge>
                ))}
            </div>
        );
    };

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "revokeClientScopesTitle",
        messageKey: t("revokeClientScopes", {
            clientId: selectedClient?.clientId
        }),
        continueButtonLabel: "revoke",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await adminClient.users.revokeConsent({
                    id,
                    clientId: selectedClient!.clientId!
                });

                refresh();

                toast.success(t("deleteGrantsSuccess"));
            } catch (error) {
                toast.error(t("deleteGrantsError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        }
    });

    const columns: ColumnDef<UserConsentRepresentation>[] = [
        { accessorKey: "clientId", header: t("Client"), cell: ({ getValue }) => getValue() ?? "—" },
        { accessorKey: "grantedClientScopes", header: t("grantedClientScopes"), cell: ({ row }) => clientScopesRenderer(row.original) },
        { accessorKey: "createdDate", header: t("created"), cell: ({ row }) => row.original.createdDate ? formatDate(new Date(row.original.createdDate)) : "—" },
        { accessorKey: "lastUpdatedDate", header: t("lastUpdated"), cell: ({ row }) => row.original.lastUpdatedDate ? formatDate(new Date(row.original.lastUpdatedDate)) : "—" },
        {
            id: "actions",
            cell: ({ row }) => (
                <DataTableRowActions row={row}>
                    <DropdownMenuItem
                        onClick={() => { setSelectedClient(row.original); toggleDeleteDialog(); }}
                    >
                        <Trash className="size-4" />
                        {t("revoke")}
                    </DropdownMenuItem>
                </DataTableRowActions>
            )
        }
    ];

    const emptyContent = (
        <Empty className="py-12">
            <EmptyMedia><Cube className="size-12 text-muted-foreground" /></EmptyMedia>
            <EmptyHeader><EmptyTitle>{t("noConsents")}</EmptyTitle></EmptyHeader>
            <EmptyContent><EmptyDescription>{t("noConsentsText")}</EmptyDescription></EmptyContent>
        </Empty>
    );

    return (
        <>
            <DeleteConfirm />
            <DataTable<UserConsentRepresentation>
                key={key}
                columns={columns}
                data={consents}
                searchColumnId="clientId"
                searchPlaceholder=" "
                emptyContent={emptyContent}
                emptyMessage={t("noConsents")}
            />
        </>
    );
};
