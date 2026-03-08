import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
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
import { DropdownMenuItem } from "@merge-rd/ui/components/dropdown-menu";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge-rd/ui/components/empty";
import { Switch } from "@merge-rd/ui/components/switch";
import { useState } from "react";
import { toast } from "sonner";
import {
    type ColumnDef,
    DataTable,
    DataTableRowActions
} from "@/admin/shared/ui/data-table";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { useParams } from "../../shared/lib/useParams";
import useToggle from "../../shared/lib/useToggle";
import { ManageOrderDialog } from "../identity-providers/manage-order-dialog";
import { useHasIdentityProviders } from "./api/use-has-identity-providers";
import { useOrganizationIdentityProviders } from "./api/use-organization-identity-providers";
import { useUnlinkIdentityProvider } from "./api/use-unlink-identity-provider";
import { useUpdateIdentityProvider } from "./api/use-update-identity-provider";
import { LinkIdentityProviderModal } from "./link-identity-provider-modal";
import type { EditOrganizationParams } from "../../shared/lib/routes/organizations";

type ShownOnLoginPageCheckProps = {
    row: IdentityProviderRepresentation;
};

type IdentityProvidersTableProps = {
    orgId: string;
    setSelectedRow: (row: IdentityProviderRepresentation | undefined) => void;
    toggleOpen: () => void;
    setManageDisplayDialog: (v: boolean) => void;
    setIdpToUnlink: (row: IdentityProviderRepresentation | undefined) => void;
};

const IdentityProvidersTable = ({
    orgId,
    setSelectedRow,
    toggleOpen,
    setManageDisplayDialog,
    setIdpToUnlink
}: IdentityProvidersTableProps) => {
    const { t } = useTranslation();
    const { data: providers = [] } = useOrganizationIdentityProviders(orgId);

    const columns: ColumnDef<IdentityProviderRepresentation>[] = [
        { accessorKey: "alias", header: t("alias") },
        {
            id: "domain",
            header: t("domain"),
            cell: ({ row }) => row.original.config?.["kc.org.domain"] ?? "—"
        },
        { accessorKey: "providerId", header: t("providerDetails") },
        {
            accessorKey: "hideOnLogin",
            header: t("hideOnLoginPage"),
            cell: ({ row }) => <ShownOnLoginPageCheck row={row.original} />
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DataTableRowActions row={row}>
                    <DropdownMenuItem
                        onClick={() => {
                            setSelectedRow(row.original);
                            toggleOpen();
                        }}
                    >
                        {t("edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setIdpToUnlink(row.original)}
                        className="text-destructive"
                    >
                        {t("unLinkIdentityProvider")}
                    </DropdownMenuItem>
                </DataTableRowActions>
            )
        }
    ];

    const emptyContent = (
        <Empty className="py-12">
            <EmptyHeader>
                <EmptyTitle>{t("emptyIdentityProviderLink")}</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
                <EmptyDescription>
                    {t("emptyIdentityProviderLinkInstructions")}
                </EmptyDescription>
            </EmptyContent>
            <Button
                className="mt-2"
                onClick={() => {
                    setSelectedRow(undefined);
                    toggleOpen();
                }}
            >
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
                    <Button
                        onClick={() => {
                            setSelectedRow(undefined);
                            toggleOpen();
                        }}
                    >
                        {t("linkIdentityProvider")}
                    </Button>
                    <Button
                        data-testid="manageDisplayOrder"
                        variant="link"
                        onClick={() => setManageDisplayDialog(true)}
                    >
                        {t("manageDisplayOrder")}
                    </Button>
                </>
            }
        />
    );
};

const ShownOnLoginPageCheck = ({ row }: ShownOnLoginPageCheckProps) => {
    const { t } = useTranslation();
    const updateMutation = useUpdateIdentityProvider();

    const toggle = async (value: boolean) => {
        try {
            await updateMutation.mutateAsync({
                ...row,
                hideOnLogin: value
            });
            toast.success(t("linkUpdatedSuccessful"));
        } catch (error) {
            toast.error(t("linkUpdatedError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    return <Switch checked={row.hideOnLogin} onCheckedChange={value => toggle(value)} />;
};

export const IdentityProviders = () => {
    const { t } = useTranslation();
    const { id: orgId } = useParams<EditOrganizationParams>();

    const { data: hasProviders = false } = useHasIdentityProviders();
    const unlinkMutation = useUnlinkIdentityProvider(orgId!);

    const [manageDisplayDialog, setManageDisplayDialog] = useState(false);
    const [selectedRow, setSelectedRow] = useState<IdentityProviderRepresentation>();
    const [idpToUnlink, setIdpToUnlink] = useState<IdentityProviderRepresentation>();
    const [open, toggleOpen] = useToggle();

    const onUnlinkConfirm = async () => {
        if (!idpToUnlink?.alias || !orgId) return;
        try {
            await unlinkMutation.mutateAsync(idpToUnlink.alias);
            setIdpToUnlink(undefined);
            toast.success(t("unLinkSuccessful"));
        } catch (error) {
            toast.error(t("unLinkError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    return (
        <>
            {manageDisplayDialog && (
                <ManageOrderDialog
                    orgId={orgId!}
                    onClose={() => {
                        setManageDisplayDialog(false);
                    }}
                />
            )}
            <div className="p-6">
                <AlertDialog
                    open={!!idpToUnlink}
                    onOpenChange={open => !open && setIdpToUnlink(undefined)}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {t("identityProviderUnlink")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {t("identityProviderUnlinkConfirm")}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                                variant="destructive"
                                data-testid="confirm"
                                onClick={onUnlinkConfirm}
                            >
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
                        }}
                    />
                )}
                {!hasProviders ? (
                    <Empty className="py-12">
                        <EmptyHeader>
                            <EmptyTitle>{t("noIdentityProvider")}</EmptyTitle>
                        </EmptyHeader>
                        <EmptyContent>
                            <EmptyDescription>
                                {t("noIdentityProviderInstructions")}
                            </EmptyDescription>
                        </EmptyContent>
                    </Empty>
                ) : (
                    <IdentityProvidersTable
                        orgId={orgId!}
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
