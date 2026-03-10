import type FederatedIdentityRepresentation from "@keycloak/keycloak-admin-client/lib/defs/federatedIdentityRepresentation";
import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Badge } from "@merge-rd/ui/components/badge";
import { Button } from "@merge-rd/ui/components/button";
import { Empty, EmptyHeader, EmptyTitle } from "@merge-rd/ui/components/empty";
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TablePaginationFooter,
    TableRow
} from "@merge-rd/ui/components/table";
import { Link } from "@tanstack/react-router";
import { capitalize } from "lodash-es";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    FormPanel,
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner
} from "@/shared/keycloak-ui-shared";
import { useAccess } from "@/admin/app/providers/access/access";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { useServerInfo } from "@/admin/app/providers/server-info/server-info-provider";
import { toIdentityProvider } from "@/admin/shared/lib/routes/identity-providers";
import { emptyFormatter, upperCaseFormatter } from "@/admin/shared/lib/util";
import { useConfirmDialog } from "@/admin/shared/ui/confirm-dialog/confirm-dialog";
import { useAvailableIdPs as useAvailableIdPsQuery } from "./hooks/use-available-idps";
import { useFederatedIdentities } from "./hooks/use-federated-identities";
import { useLinkedIdPs } from "./hooks/use-linked-idps";
import { useUnlinkFederatedIdentity } from "./hooks/use-unlink-federated-identity";
import { UserIdpModal } from "./user-id-p-modal";

type UserIdentityProviderLinksProps = {
    userId: string;
};

export const UserIdentityProviderLinks = ({ userId }: UserIdentityProviderLinksProps) => {
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
    const { mutateAsync: unlinkFederatedIdentityMut } = useUnlinkFederatedIdentity(userId);

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
                await unlinkFederatedIdentityMut(federatedId);
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

    const { data: availableIdPs = [], refetch: refetchAvailableIdPs } =
        useAvailableIdPsQuery();

    // Available IdPs search/pagination state
    const [availableSearch, setAvailableSearch] = useState("");
    const [availablePageSize, setAvailablePageSize] = useState(10);
    const [availableCurrentPage, setAvailableCurrentPage] = useState(0);

    const filteredAvailableIdPs = useMemo(() => {
        if (!availableSearch) return availableIdPs;
        const lower = availableSearch.toLowerCase();
        return availableIdPs.filter((idp: IdentityProviderRepresentation) =>
            idp.alias?.toLowerCase().includes(lower)
        );
    }, [availableIdPs, availableSearch]);

    const availableTotalCount = filteredAvailableIdPs.length;
    const availableTotalPages = Math.ceil(availableTotalCount / availablePageSize);
    const paginatedAvailableIdPs = useMemo(() => {
        const start = availableCurrentPage * availablePageSize;
        return filteredAvailableIdPs.slice(start, start + availablePageSize);
    }, [filteredAvailableIdPs, availableCurrentPage, availablePageSize]);

    useEffect(() => {
        setAvailableCurrentPage(0);
    }, [availableSearch, availablePageSize]);

    const linkedColCount = canQueryIDPDetails ? 5 : 4;

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
                    <Table className="table-fixed kc-linked-IdPs-table">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[25%]">{t("name")}</TableHead>
                                {canQueryIDPDetails && (
                                    <TableHead className="w-[15%]">{t("type")}</TableHead>
                                )}
                                <TableHead className="w-[20%]">{t("userID")}</TableHead>
                                <TableHead className="w-[20%]">{t("username")}</TableHead>
                                <TableHead className="w-[20%]" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {linkedIdPs.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={linkedColCount}
                                        className="text-center text-muted-foreground"
                                    >
                                        <Empty className="py-8">
                                            <EmptyHeader>
                                                <EmptyTitle>
                                                    {t("noProvidersLinked")}
                                                </EmptyTitle>
                                            </EmptyHeader>
                                        </Empty>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                linkedIdPs.map((idp: WithProviderId) => (
                                    <TableRow key={idp.identityProvider}>
                                        <TableCell>
                                            {idpLinkRenderer(idp)}
                                        </TableCell>
                                        {canQueryIDPDetails && (
                                            <TableCell>
                                                {badgeRenderer1(idp)}
                                            </TableCell>
                                        )}
                                        <TableCell className="truncate">
                                            {emptyFormatter()(idp.userId)}
                                        </TableCell>
                                        <TableCell className="truncate">
                                            {emptyFormatter()(idp.userName)}
                                        </TableCell>
                                        <TableCell>
                                            {unlinkRenderer(idp)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </FormPanel>
                {hasAccess("manage-users") && canQueryIDPDetails && (
                    <FormPanel className="kc-available-idps" title={t("availableIdPs")}>
                        <p className="kc-available-idps-text">{t("availableIdPsText")}</p>
                        {isLoading ? (
                            <KeycloakSpinner />
                        ) : (
                            <div className="flex h-full w-full flex-col">
                                <div className="flex items-center justify-between gap-2 py-2.5">
                                    <FacetedFormFilter
                                        type="text"
                                        size="small"
                                        title={t("search")}
                                        value={availableSearch}
                                        onChange={value => setAvailableSearch(value)}
                                        placeholder={t("searchForProvider")}
                                    />
                                </div>
                                <Table className="table-fixed kc-linked-IdPs-table">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[40%]">
                                                {t("name")}
                                            </TableHead>
                                            <TableHead className="w-[30%]">
                                                {t("type")}
                                            </TableHead>
                                            <TableHead className="w-[30%]" />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedAvailableIdPs.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={3}
                                                    className="text-center text-muted-foreground"
                                                >
                                                    <Empty className="py-8">
                                                        <EmptyHeader>
                                                            <EmptyTitle>
                                                                {t(
                                                                    "noAvailableIdentityProviders"
                                                                )}
                                                            </EmptyTitle>
                                                        </EmptyHeader>
                                                    </Empty>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedAvailableIdPs.map(
                                                (idp: IdentityProviderRepresentation) => (
                                                    <TableRow key={idp.alias}>
                                                        <TableCell>
                                                            {upperCaseFormatter()(
                                                                emptyFormatter()(idp.alias)
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {badgeRenderer2(idp)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {linkRenderer(idp)}
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            )
                                        )}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell colSpan={3} className="p-0">
                                                <TablePaginationFooter
                                                    pageSize={availablePageSize}
                                                    onPageSizeChange={setAvailablePageSize}
                                                    onPreviousPage={() =>
                                                        setAvailableCurrentPage(p =>
                                                            Math.max(0, p - 1)
                                                        )
                                                    }
                                                    onNextPage={() =>
                                                        setAvailableCurrentPage(p =>
                                                            Math.min(
                                                                availableTotalPages - 1,
                                                                p + 1
                                                            )
                                                        )
                                                    }
                                                    hasPreviousPage={
                                                        availableCurrentPage > 0
                                                    }
                                                    hasNextPage={
                                                        availableCurrentPage <
                                                        availableTotalPages - 1
                                                    }
                                                    totalCount={availableTotalCount}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </div>
                        )}
                    </FormPanel>
                )}
            </div>
        </>
    );
};
