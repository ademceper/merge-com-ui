import type UserConsentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userConsentRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Badge } from "@merge-rd/ui/components/badge";
import { DropdownMenuItem } from "@merge-rd/ui/components/dropdown-menu";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle
} from "@merge-rd/ui/components/empty";
import { Cube, Trash } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import {
    type ColumnDef,
    DataTable,
    DataTableRowActions
} from "@/admin/shared/ui/data-table";
import { getErrorDescription, getErrorMessage } from "@/shared/keycloak-ui-shared";
import { useFormatDate } from "@/admin/shared/lib/use-format-date";
import { useParams } from "@/admin/shared/lib/use-params";
import { useConfirmDialog } from "@/admin/shared/ui/confirm-dialog/confirm-dialog";
import { useRevokeConsent } from "./hooks/use-revoke-consent";
import { useUserConsents as useUserConsentsQuery } from "./hooks/use-user-consents";

export const UserConsents = () => {

    const [selectedClient, setSelectedClient] = useState<UserConsentRepresentation>();
    const { t } = useTranslation();
    const formatDate = useFormatDate();

    const { id } = useParams<{ id: string }>();

    const { data: consents = [], refetch: refreshConsents } = useUserConsentsQuery(id);
    const { mutateAsync: revokeConsentMut } = useRevokeConsent(id);
    const refresh = () => refreshConsents();

    const clientScopesRenderer = ({ grantedClientScopes }: UserConsentRepresentation) => {
        return (
            <div className="flex gap-1 flex-wrap kc-consents-chip-group">
                {grantedClientScopes!.map(currentChip => (
                    <Badge
                        key={currentChip}
                        variant="secondary"
                        className="kc-consents-chip"
                    >
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
                await revokeConsentMut(selectedClient!.clientId!);

                refresh();

                toast.success(t("deleteGrantsSuccess"));
            } catch (error) {
                toast.error(t("deleteGrantsError", { error: getErrorMessage(error) }), {
                    description: getErrorDescription(error)
                });
            }
        }
    });

    const columns: ColumnDef<UserConsentRepresentation>[] = [
        {
            accessorKey: "clientId",
            header: t("Client"),
            cell: ({ getValue }) => getValue() ?? "—"
        },
        {
            accessorKey: "grantedClientScopes",
            header: t("grantedClientScopes"),
            cell: ({ row }) => clientScopesRenderer(row.original)
        },
        {
            accessorKey: "createdDate",
            header: t("created"),
            cell: ({ row }) =>
                row.original.createdDate
                    ? formatDate(new Date(row.original.createdDate))
                    : "—"
        },
        {
            accessorKey: "lastUpdatedDate",
            header: t("lastUpdated"),
            cell: ({ row }) =>
                row.original.lastUpdatedDate
                    ? formatDate(new Date(row.original.lastUpdatedDate))
                    : "—"
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DataTableRowActions row={row}>
                    <DropdownMenuItem
                        onClick={() => {
                            setSelectedClient(row.original);
                            toggleDeleteDialog();
                        }}
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
            <EmptyMedia>
                <Cube className="size-12 text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
                <EmptyTitle>{t("noConsents")}</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
                <EmptyDescription>{t("noConsentsText")}</EmptyDescription>
            </EmptyContent>
        </Empty>
    );

    return (
        <>
            <DeleteConfirm />
            <DataTable<UserConsentRepresentation>
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
