import IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { getErrorDescription, getErrorMessage, useFetch } from "../../shared/keycloak-ui-shared";
import { DataTable, DataTableRowActions, type ColumnDef } from "@merge/ui/components/table";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge/ui/components/empty";
import { DropdownMenuItem } from "@merge/ui/components/dropdown-menu";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { Switch } from "@merge/ui/components/switch";
import { sortBy } from "lodash-es";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useAdminClient } from "../admin-client";
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
import { ManageOrderDialog } from "../identity-providers/ManageOrderDialog";
import useToggle from "../utils/useToggle";
import { LinkIdentityProviderModal } from "./LinkIdentityProviderModal";
import { EditOrganizationParams } from "./routes/EditOrganization";

type ShownOnLoginPageCheckProps = {
    row: IdentityProviderRepresentation;
    refresh: () => void;
};

type IdentityProvidersTableProps = {
    refreshKey: number;
    orgId: string;
    refresh: () => void;
    setSelectedRow: (row: IdentityProviderRepresentation | undefined) => void;
    toggleOpen: () => void;
    setManageDisplayDialog: (v: boolean) => void;
    setIdpToUnlink: (row: IdentityProviderRepresentation | undefined) => void;
};

const IdentityProvidersTable = ({
    orgId,
    refreshKey,
    refresh,
    setSelectedRow,
    toggleOpen,
    setManageDisplayDialog,
    setIdpToUnlink
}: IdentityProvidersTableProps) => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const [providers, setProviders] = useState<IdentityProviderRepresentation[]>([]);

    useFetch(
        async () => sortBy(await adminClient.organizations.listIdentityProviders({ orgId }), "alias"),
        setProviders,
        [orgId, refreshKey]
    );

    const columns: ColumnDef<IdentityProviderRepresentation>[] = [
        { accessorKey: "alias", header: t("alias") },
        { id: "domain", header: t("domain"), cell: ({ row }) => (row.original.config?.["kc.org.domain"] ?? "—") },
        { accessorKey: "providerId", header: t("providerDetails") },
        {
            accessorKey: "hideOnLogin",
            header: t("hideOnLoginPage"),
            cell: ({ row }) => <ShownOnLoginPageCheck row={row.original} refresh={refresh} />
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DataTableRowActions row={row}>
                    <DropdownMenuItem onClick={() => { setSelectedRow(row.original); toggleOpen(); }}>
                        {t("edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIdpToUnlink(row.original)} className="text-destructive">
                        {t("unLinkIdentityProvider")}
                    </DropdownMenuItem>
                </DataTableRowActions>
            )
        }
    ];

    const emptyContent = (
        <Empty className="py-12">
            <EmptyHeader><EmptyTitle>{t("emptyIdentityProviderLink")}</EmptyTitle></EmptyHeader>
            <EmptyContent><EmptyDescription>{t("emptyIdentityProviderLinkInstructions")}</EmptyDescription></EmptyContent>
            <Button className="mt-2" onClick={() => { setSelectedRow(undefined); toggleOpen(); }}>
                {t("linkIdentityProvider")}
            </Button>
        </Empty>
    );

    return (
        <DataTable<IdentityProviderRepresentation>
            columns={columns}
            data={providers}
            searchColumnId="alias"
            searchPlaceholder={t("searchProvider")}
            emptyContent={emptyContent}
            emptyMessage={t("emptyIdentityProviderLink")}
            toolbar={
                <>
                    <Button onClick={() => { setSelectedRow(undefined); toggleOpen(); }}>{t("linkIdentityProvider")}</Button>
                    <Button data-testid="manageDisplayOrder" variant="link" onClick={() => setManageDisplayDialog(true)}>
                        {t("manageDisplayOrder")}
                    </Button>
                </>
            }
        />
    );
};

const ShownOnLoginPageCheck = ({ row, refresh }: ShownOnLoginPageCheckProps) => {
    const { adminClient } = useAdminClient();
const { t } = useTranslation();

    const toggle = async (value: boolean) => {
        try {
            await adminClient.identityProviders.update(
                { alias: row.alias! },
                {
                    ...row,
                    hideOnLogin: value
                }
            );
            toast.success(t("linkUpdatedSuccessful"));

            refresh();
        } catch (error) {
            toast.error(t("linkUpdatedError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <Switch
            checked={row.hideOnLogin}
            onCheckedChange={(value) => toggle(value)}
        />
    );
};

export const IdentityProviders = () => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const { id: orgId } = useParams<EditOrganizationParams>();
const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);

    const [manageDisplayDialog, setManageDisplayDialog] = useState(false);
    const [hasProviders, setHasProviders] = useState(false);
    const [selectedRow, setSelectedRow] = useState<IdentityProviderRepresentation>();
    const [idpToUnlink, setIdpToUnlink] = useState<IdentityProviderRepresentation>();
    const [open, toggleOpen] = useToggle();

    useFetch(
        async () => adminClient.identityProviders.find({ max: 1 }),
        providers => {
            setHasProviders(providers.length === 1);
        },
        []
    );

    const onUnlinkConfirm = async () => {
        if (!idpToUnlink?.alias || !orgId) return;
        try {
            await adminClient.organizations.unLinkIdp({
                orgId,
                alias: idpToUnlink.alias as string
            });
            setIdpToUnlink(undefined);
            toast.success(t("unLinkSuccessful"));
            refresh();
        } catch (error) {
            toast.error(t("unLinkError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <>
            {manageDisplayDialog && (
                <ManageOrderDialog
                    orgId={orgId!}
                    onClose={() => {
                        setManageDisplayDialog(false);
                        refresh();
                    }}
                />
            )}
            <div className="p-6">
                <AlertDialog open={!!idpToUnlink} onOpenChange={(open) => !open && setIdpToUnlink(undefined)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t("identityProviderUnlink")}</AlertDialogTitle>
                            <AlertDialogDescription>{t("identityProviderUnlinkConfirm")}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                            <AlertDialogAction variant="destructive" data-testid="confirm" onClick={onUnlinkConfirm}>
                                {t("unLinkIdentityProvider")}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                {open && (
                    <LinkIdentityProviderModal
                        orgId={orgId!}
                        identityProvider={selectedRow}
                        onClose={() => {
                            toggleOpen();
                            refresh();
                        }}
                    />
                )}
                {!hasProviders ? (
                    <Empty className="py-12">
                        <EmptyHeader><EmptyTitle>{t("noIdentityProvider")}</EmptyTitle></EmptyHeader>
                        <EmptyContent><EmptyDescription>{t("noIdentityProviderInstructions")}</EmptyDescription></EmptyContent>
                    </Empty>
                ) : (
                    <IdentityProvidersTable
                        key={key}
                        refreshKey={key}
                        orgId={orgId!}
                        refresh={refresh}
                        setSelectedRow={setSelectedRow}
                        toggleOpen={toggleOpen}
                        setManageDisplayDialog={setManageDisplayDialog}
                        setIdpToUnlink={setIdpToUnlink}
                    />
                )}
            </div>
        </>
    );
};
