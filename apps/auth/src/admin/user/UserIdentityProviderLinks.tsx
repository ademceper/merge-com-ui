import type FederatedIdentityRepresentation from "@keycloak/keycloak-admin-client/lib/defs/federatedIdentityRepresentation";
import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { KeycloakSpinner } from "../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Badge } from "@merge/ui/components/badge";
import { capitalize } from "lodash-es";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FormPanel } from "../../shared/keycloak-ui-shared";
import { useAdminClient } from "../admin-client";
import { getErrorDescription, getErrorMessage, useFetch } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { DataTable, type ColumnDef } from "@merge/ui/components/table";
import { Empty, EmptyHeader, EmptyTitle } from "@merge/ui/components/empty";
import { useRealm } from "../context/realm-context/RealmContext";
import { useServerInfo } from "../context/server-info/ServerInfoProvider";
import { toIdentityProvider } from "../identity-providers/routes/IdentityProvider";
import { emptyFormatter, upperCaseFormatter } from "../util";
import { UserIdpModal } from "./UserIdPModal";
import { useAccess } from "../context/access/Access";

type UserIdentityProviderLinksProps = {
    userId: string;
};

export const UserIdentityProviderLinks = ({ userId }: UserIdentityProviderLinksProps) => {
    const { adminClient } = useAdminClient();
    const [key, setKey] = useState(0);
    const [linkedNames, setLinkedNames] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [federatedId, setFederatedId] = useState("");
    const [isLinkIdPModalOpen, setIsLinkIdPModalOpen] = useState(false);
    const { realm } = useRealm();
const { t } = useTranslation();
    const { hasAccess, hasSomeAccess } = useAccess();

    const canQueryIDPDetails = hasSomeAccess(
        "manage-identity-providers",
        "view-identity-providers"
    );

    useFetch(
        () => adminClient.users.listFederatedIdentities({ id: userId }),
        linkedIdentities => {
            setLinkedNames(linkedIdentities.map(identity => identity.identityProvider!));
            setIsLoading(false);
        },
        [userId, key]
    );

    const refresh = () => {
        setKey(new Date().getTime());
        setIsLoading(true);
    };

    type WithProviderId = FederatedIdentityRepresentation & {
        providerId: string;
    };

    const identityProviders = useServerInfo().identityProviders;

    const getFederatedIdentities = async () => {
        const allFedIds = (await adminClient.users.listFederatedIdentities({
            id: userId
        })) as WithProviderId[];

        if (canQueryIDPDetails) {
            const allProviders = await adminClient.identityProviders.find();
            for (const element of allFedIds) {
                element.providerId = allProviders.find(
                    item => item.alias === element.identityProvider
                )?.providerId!;
            }
        }

        return allFedIds;
    };

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
                toast.error(t("mappingDeletedError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        }
    });

    const idpLinkRenderer = (idp: WithProviderId) => {
        if (!canQueryIDPDetails) return <span>{capitalize(idp.identityProvider)}</span>;

        return (
            <Link
                to={toIdentityProvider({
                    realm,
                    providerId: idp.providerId,
                    alias: idp.identityProvider!,
                    tab: "settings"
                })}
            >
                {capitalize(idp.identityProvider)}
            </Link>
        );
    };

    const badgeRenderer1 = (idp: FederatedIdentityRepresentation) => {
        const groupName = identityProviders?.find(
            provider => provider["id"] === idp.identityProvider
        )?.groupName!;
        return (
            <Badge variant={groupName === "Social" ? "default" : "secondary"}>
                {groupName === "Social" ? t("idpType.social") : t("idpType.custom")}
            </Badge>
        );
    };

    const badgeRenderer2 = (idp: IdentityProviderRepresentation) => {
        const groupName = identityProviders?.find(
            provider => provider["id"] === idp.providerId
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

    const [linkedIdPs, setLinkedIdPs] = useState<WithProviderId[]>([]);
    useFetch(() => getFederatedIdentities(), setLinkedIdPs, [userId, key]);

    const linkedColumns: ColumnDef<WithProviderId>[] = [
        { accessorKey: "identityProvider", header: t("name"), cell: ({ row }) => idpLinkRenderer(row.original) },
        ...(canQueryIDPDetails ? [{ accessorKey: "type", header: t("type"), cell: ({ row }) => badgeRenderer1(row.original) }] as ColumnDef<WithProviderId>[] : []),
        { accessorKey: "userId", header: t("userID"), cell: ({ getValue }) => emptyFormatter()(getValue()) },
        { accessorKey: "userName", header: t("username"), cell: ({ getValue }) => emptyFormatter()(getValue()) },
        { id: "unlink", header: "", cell: ({ row }) => unlinkRenderer(row.original) }
    ];

    const [availableIdPs, setAvailableIdPs] = useState<IdentityProviderRepresentation[]>([]);
    useFetch(() => adminClient.identityProviders.find({ first: 0, max: 500, realmOnly: false, capability: "USER_LINKING" }), setAvailableIdPs, [key]);

    const availableColumns: ColumnDef<IdentityProviderRepresentation>[] = [
        { accessorKey: "alias", header: t("name"), cell: ({ getValue }) => upperCaseFormatter()(emptyFormatter()(getValue())) },
        { accessorKey: "type", header: t("type"), cell: ({ row }) => badgeRenderer2(row.original) },
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
                        key={key}
                        columns={linkedColumns}
                        data={linkedIdPs}
                        emptyContent={
                            <Empty className="py-8">
                                <EmptyHeader><EmptyTitle>{t("noProvidersLinked")}</EmptyTitle></EmptyHeader>
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
                                key={key}
                                columns={availableColumns}
                                data={availableIdPs}
                                searchColumnId="alias"
                                searchPlaceholder={t("searchForProvider")}
                                emptyContent={
                                    <Empty className="py-8">
                                        <EmptyHeader><EmptyTitle>{t("noAvailableIdentityProviders")}</EmptyTitle></EmptyHeader>
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
