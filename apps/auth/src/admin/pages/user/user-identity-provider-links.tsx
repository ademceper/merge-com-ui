import type FederatedIdentityRepresentation from "@keycloak/keycloak-admin-client/lib/defs/federatedIdentityRepresentation";
import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Badge } from "@merge-rd/ui/components/badge";
import { Button } from "@merge-rd/ui/components/button";
import { Empty, EmptyHeader, EmptyTitle } from "@merge-rd/ui/components/empty";
import { Link } from "@tanstack/react-router";
import { capitalize } from "lodash-es";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type ColumnDef, DataTable } from "@/admin/shared/ui/data-table";
import {
    FormPanel,
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner
} from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../app/admin-client";
import { useAccess } from "../../app/providers/access/access";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { useServerInfo } from "../../app/providers/server-info/server-info-provider";
import { emptyFormatter, upperCaseFormatter } from "../../shared/lib/util";
import { useConfirmDialog } from "../../shared/ui/confirm-dialog/confirm-dialog";
import { toIdentityProvider } from "../../shared/lib/routes/identity-providers";
import { useAvailableIdPs as useAvailableIdPsQuery } from "./api/use-available-idps";
import { useFederatedIdentities } from "./api/use-federated-identities";
import { useLinkedIdPs } from "./api/use-linked-idps";
import { UserIdpModal } from "./user-id-p-modal";

type UserIdentityProviderLinksProps = {
    userId: string;
};

export const UserIdentityProviderLinks = ({ userId }: UserIdentityProviderLinksProps) => {
    const { adminClient } = useAdminClient();
    const [linkedNames, setLinkedNames] = useState<string[]>([]);
    const [federatedId, setFederatedId] = useState("");
    const [isLinkIdPModalOpen, setIsLinkIdPModalOpen] = useState(false);
    const { realm } = useRealm();
    const { t } = useTranslation();
    const { hasAccess, hasSomeAccess } = useAccess();

    const canQueryIDPDetails = hasSomeAccess(
        "manage-identity-providers",
        "view-identity-providers"
    );

    const { data: federatedIdentities, refetch: refetchFederated } =
        useFederatedIdentities(userId);

    useEffect(() => {
        if (federatedIdentities) {
            setLinkedNames(
                federatedIdentities.map(identity => identity.identityProvider!)
            );
        }
    }, [federatedIdentities]);

    const isLoading = !federatedIdentities;

    const refresh = () => {
        refetchFederated();
        refetchLinkedIdPs();
        refetchAvailableIdPs();
    };

    type WithProviderId = FederatedIdentityRepresentation & {
        providerId: string;
    };

    const identityProviders = useServerInfo().identityProviders;

    const [toggleUnlinkDialog, UnlinkConfirm] = useConfirmDialog({
        titleKey: t("unlinkAccountTitle", {
            provider: capitalize(federatedId)
        }),
        messageKey: t("unlinkAccountConfirm", {
            provider: capitalize(federatedId)
        }),
        continueButtonLabel: "unlink",
        continueButtonVariant: "default",
        onConfirm: async () => {
            try {
                await adminClient.users.delFromFederatedIdentity({
                    id: userId,
                    federatedIdentityId: federatedId
                });
                toast.success(t("idpUnlinkSuccess"));
                refresh();
            } catch (error) {
                toast.error(t("mappingDeletedError", { error: getErrorMessage(error) }), {
                    description: getErrorDescription(error)
                });
            }
        }
    });

    const idpLinkRenderer = (idp: WithProviderId) => {
        if (!canQueryIDPDetails) return <span>{capitalize(idp.identityProvider)}</span>;

        return (
            <Link
                to={
                    toIdentityProvider({
                        realm,
                        providerId: idp.providerId,
                        alias: idp.identityProvider!,
                        tab: "settings"
                    }) as string
                }
            >
                {capitalize(idp.identityProvider)}
            </Link>
        );
    };

    const badgeRenderer1 = (idp: FederatedIdentityRepresentation) => {
        const groupName = identityProviders?.find(
            provider => provider.id === idp.identityProvider
        )?.groupName!;
        return (
            <Badge variant={groupName === "Social" ? "default" : "secondary"}>
                {groupName === "Social" ? t("idpType.social") : t("idpType.custom")}
            </Badge>
        );
    };

    const badgeRenderer2 = (idp: IdentityProviderRepresentation) => {
        const groupName = identityProviders?.find(
            provider => provider.id === idp.providerId
        )?.groupName!;
        return (
            <Badge variant={groupName === "User-defined" ? "secondary" : "default"}>
                {groupName === "User-defined"
                    ? "Custom"
                    : groupName! === "Social"
                      ? t("idpType.social")
                      : groupName!}
            </Badge>
        );
    };

    const unlinkRenderer = (fedIdentity: FederatedIdentityRepresentation) => {
        if (!hasAccess("manage-users")) return <span />;

        return (
            <Button
                variant="link"
                onClick={() => {
                    setFederatedId(fedIdentity.identityProvider!);
                    toggleUnlinkDialog();
                }}
            >
                {t("unlinkAccount")}
            </Button>
        );
    };

    const linkRenderer = (idp: IdentityProviderRepresentation) => {
        if (linkedNames.includes(idp.alias!)) return <span />;

        return (
            <Button
                variant="link"
                onClick={() => {
                    setFederatedId(idp.alias!);
                    setIsLinkIdPModalOpen(true);
                }}
            >
                {t("linkAccount")}
            </Button>
        );
    };

    const { data: linkedIdPs = [], refetch: refetchLinkedIdPs } = useLinkedIdPs(
        userId,
        canQueryIDPDetails
    );

    const linkedColumns: ColumnDef<WithProviderId>[] = [
        {
            accessorKey: "identityProvider",
            header: t("name"),
            cell: ({ row }) => idpLinkRenderer(row.original)
        },
        ...(canQueryIDPDetails
            ? ([
                  {
                      accessorKey: "type",
                      header: t("type"),
                      cell: ({ row }) => badgeRenderer1(row.original)
                  }
              ] as ColumnDef<WithProviderId>[])
            : []),
        {
            accessorKey: "userId",
            header: t("userID"),
            cell: ({ getValue }) => emptyFormatter()(getValue())
        },
        {
            accessorKey: "userName",
            header: t("username"),
            cell: ({ getValue }) => emptyFormatter()(getValue())
        },
        { id: "unlink", header: "", cell: ({ row }) => unlinkRenderer(row.original) }
    ];

    const { data: availableIdPs = [], refetch: refetchAvailableIdPs } =
        useAvailableIdPsQuery();

    const availableColumns: ColumnDef<IdentityProviderRepresentation>[] = [
        {
            accessorKey: "alias",
            header: t("name"),
            cell: ({ getValue }) => upperCaseFormatter()(emptyFormatter()(getValue()))
        },
        {
            accessorKey: "type",
            header: t("type"),
            cell: ({ row }) => badgeRenderer2(row.original)
        },
        { id: "link", header: "", cell: ({ row }) => linkRenderer(row.original) }
    ];

    return (
        <>
            {isLinkIdPModalOpen && (
                <UserIdpModal
                    userId={userId}
                    federatedId={federatedId}
                    onClose={() => setIsLinkIdPModalOpen(false)}
                    onRefresh={refresh}
                />
            )}
            <UnlinkConfirm />
            <div className="p-0">
                <FormPanel title={t("linkedIdPs")} className="kc-linked-idps">
                    <p className="kc-available-idps-text">{t("linkedIdPsText")}</p>
                    <DataTable<WithProviderId>
                        columns={linkedColumns}
                        data={linkedIdPs}
                        emptyContent={
                            <Empty className="py-8">
                                <EmptyHeader>
                                    <EmptyTitle>{t("noProvidersLinked")}</EmptyTitle>
                                </EmptyHeader>
                            </Empty>
                        }
                        emptyMessage={t("noProvidersLinked")}
                        className="kc-linked-IdPs-table"
                    />
                </FormPanel>
                {hasAccess("manage-users") && canQueryIDPDetails && (
                    <FormPanel className="kc-available-idps" title={t("availableIdPs")}>
                        <p className="kc-available-idps-text">{t("availableIdPsText")}</p>
                        {isLoading ? (
                            <KeycloakSpinner />
                        ) : (
                            <DataTable<IdentityProviderRepresentation>
                                columns={availableColumns}
                                data={availableIdPs}
                                searchColumnId="alias"
                                searchPlaceholder={t("searchForProvider")}
                                emptyContent={
                                    <Empty className="py-8">
                                        <EmptyHeader>
                                            <EmptyTitle>
                                                {t("noAvailableIdentityProviders")}
                                            </EmptyTitle>
                                        </EmptyHeader>
                                    </Empty>
                                }
                                emptyMessage={t("noAvailableIdentityProviders")}
                                className="kc-linked-IdPs-table"
                            />
                        )}
                    </FormPanel>
                )}
            </div>
        </>
    );
};
