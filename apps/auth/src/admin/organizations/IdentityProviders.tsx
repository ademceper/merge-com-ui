import IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { getErrorDescription, getErrorMessage, KeycloakDataTable,
    ListEmptyState,
    useFetch } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { Switch } from "@merge/ui/components/switch";
import { sortBy } from "lodash-es";
import { Bell } from "@phosphor-icons/react";
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

    const loader = async () => {
        const providers = await adminClient.organizations.listIdentityProviders({
            orgId: orgId!
        });
        return sortBy(providers, "alias");
    };

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
                    <ListEmptyState
                        icon={Bell}
                        message={t("noIdentityProvider")}
                        instructions={t("noIdentityProviderInstructions")}
                    />
                ) : (
                    <KeycloakDataTable
                        key={key}
                        loader={loader}
                        ariaLabelKey="identityProviders"
                        searchPlaceholderKey="searchProvider"
                        toolbarItem={
                            <>
                                <div>
                                    <Button
                                        onClick={() => {
                                            setSelectedRow(undefined);
                                            toggleOpen();
                                        }}
                                    >
                                        {t("linkIdentityProvider")}
                                    </Button>
                                </div>
                                <div>
                                    <Button
                                        data-testid="manageDisplayOrder"
                                        variant="link"
                                        onClick={() => setManageDisplayDialog(true)}
                                    >
                                        {t("manageDisplayOrder")}
                                    </Button>
                                </div>
                            </>
                        }
                        actions={[
                            {
                                title: t("edit"),
                                onRowClick: row => {
                                    setSelectedRow(row);
                                    toggleOpen();
                                }
                            },
                            {
                                title: t("unLinkIdentityProvider"),
                                onRowClick: row => setIdpToUnlink(row)
                            }
                        ]}
                        columns={[
                            {
                                name: "alias"
                            },
                            {
                                name: "config['kc.org.domain']",
                                displayKey: "domain"
                            },
                            {
                                name: "providerId",
                                displayKey: "providerDetails"
                            },
                            {
                                name: "hideOnLogin",
                                displayKey: "hideOnLoginPage",
                                cellRenderer: row => (
                                    <ShownOnLoginPageCheck row={row} refresh={refresh} />
                                )
                            }
                        ]}
                        emptyState={
                            <ListEmptyState
                                message={t("emptyIdentityProviderLink")}
                                instructions={t("emptyIdentityProviderLinkInstructions")}
                                primaryActionText={t("linkIdentityProvider")}
                                onPrimaryAction={toggleOpen}
                            />
                        }
                    />
                )}
            </div>
        </>
    );
};
