/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/identity-providers/IdentityProvidersSection.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import type { IdentityProvidersQuery } from "@keycloak/keycloak-admin-client/lib/resources/identityProviders";
import {
    Action,
    IconMapper,
    KeycloakDataTable,
    ListEmptyState,
    useAlerts,
    useFetch
} from "../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Badge } from "@merge/ui/components/badge";
import { Checkbox } from "@merge/ui/components/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuLabel } from "@merge/ui/components/dropdown-menu";
import { CardTitle } from "@merge/ui/components/card";
import { AlertVariant } from "../../shared/keycloak-ui-shared";
import { groupBy, sortBy } from "lodash-es";
import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { ClickableCard } from "../components/keycloak-card/ClickableCard";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { useRealm } from "../context/realm-context/RealmContext";
import { useServerInfo } from "../context/server-info/ServerInfoProvider";
import helpUrls from "../help-urls";
import { toEditOrganization } from "../organizations/routes/EditOrganization";
import { upperCaseFormatter } from "../util";
import { ManageOrderDialog } from "./ManageOrderDialog";
import { toIdentityProvider } from "./routes/IdentityProvider";
import { toIdentityProviderCreate } from "./routes/IdentityProviderCreate";

const DetailLink = (identityProvider: IdentityProviderRepresentation) => {
    const { t } = useTranslation();
    const { realm } = useRealm();

    return (
        <Link
            key={identityProvider.providerId}
            to={toIdentityProvider({
                realm,
                providerId: identityProvider.providerId!,
                alias: identityProvider.alias!,
                tab: "settings"
            })}
        >
            {identityProvider.displayName || identityProvider.alias}
            {!identityProvider.enabled && (
                <Badge
                    key={`${identityProvider.providerId}-disabled`}
                    variant="secondary"
                    className="ml-2"
                >
                    {t("disabled")}
                </Badge>
            )}
        </Link>
    );
};

const OrganizationLink = (identityProvider: IdentityProviderRepresentation) => {
    const { t } = useTranslation();
    const { realm } = useRealm();

    if (!identityProvider?.organizationId) {
        return "—";
    }

    return (
        <Link
            key={identityProvider.providerId}
            to={toEditOrganization({
                realm,
                id: identityProvider.organizationId,
                tab: "identityProviders"
            })}
        >
            {t("organization")}
        </Link>
    );
};

export default function IdentityProvidersSection() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const identityProviders = groupBy(useServerInfo().identityProviders, "groupName");
    const { realm } = useRealm();
    const navigate = useNavigate();
    const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);

    const [hide, setHide] = useState(false);
    const [addProviderOpen, setAddProviderOpen] = useState(false);
    const [manageDisplayDialog, setManageDisplayDialog] = useState(false);
    const [hasProviders, setHasProviders] = useState(false);
    const [selectedProvider, setSelectedProvider] =
        useState<IdentityProviderRepresentation>();
    const { addAlert, addError } = useAlerts();

    useFetch(
        async () => adminClient.identityProviders.find({ max: 1 }),
        providers => {
            setHasProviders(providers.length === 1);
        },
        [key]
    );

    const loader = async (first?: number, max?: number, search?: string) => {
        const params: IdentityProvidersQuery = {
            first: first!,
            max: max!,
            realmOnly: hide
        };
        if (search) {
            params.search = search;
        }
        const providers = await adminClient.identityProviders.find(params);
        return providers;
    };

    const navigateToCreate = (providerId: string) =>
        navigate(
            toIdentityProviderCreate({
                realm,
                providerId
            })
        );

    const identityProviderOptions = () =>
        Object.keys(identityProviders).map(group => (
            <DropdownMenuGroup key={group}>
                <DropdownMenuLabel>{group}</DropdownMenuLabel>
                {sortBy(identityProviders[group], "name").map(provider => (
                    <DropdownMenuItem
                        key={provider.id}
                        data-testid={provider.id}
                        onClick={() =>
                            navigate(
                                toIdentityProviderCreate({
                                    realm,
                                    providerId: provider.id
                                })
                            )
                        }
                    >
                        {provider.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuGroup>
        ));

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "deleteProvider",
        messageKey: t("deleteConfirm", { provider: selectedProvider?.alias }),
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await adminClient.identityProviders.del({
                    alias: selectedProvider!.alias!
                });
                refresh();
                addAlert(t("deletedSuccessIdentityProvider"), AlertVariant.success);
            } catch (error) {
                addError("deleteErrorIdentityProvider", error);
            }
        }
    });

    return (
        <>
            <DeleteConfirm />
            {manageDisplayDialog && (
                <ManageOrderDialog
                    hideRealmBasedIdps={hide}
                    onClose={() => {
                        setManageDisplayDialog(false);
                        refresh();
                    }}
                />
            )}
            <ViewHeader
                titleKey="identityProviders"
                subKey="listExplain"
                helpUrl={helpUrls.identityProvidersUrl}
            />
            <div className={!hasProviders ? "p-6" : "p-0"}>
                {!hasProviders && (
                    <>
                        <p>{t("getStarted")}</p>
                        {Object.keys(identityProviders).map(group => (
                            <Fragment key={group}>
                                <h2 className="mt-6">
                                    {group}:
                                </h2>
                                <hr className="mb-6" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {sortBy(identityProviders[group], "name").map(
                                        provider => (
                                            <ClickableCard
                                                key={provider.id}
                                                data-testid={`${provider.id}-card`}
                                                onClick={() =>
                                                    navigateToCreate(provider.id)
                                                }
                                            >
                                                <CardTitle>
                                                    <div className="flex items-center gap-2">
                                                        <div>
                                                            <IconMapper
                                                                icon={provider.id}
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            {provider.name}
                                                        </div>
                                                    </div>
                                                </CardTitle>
                                            </ClickableCard>
                                        )
                                    )}
                                </div>
                            </Fragment>
                        ))}
                    </>
                )}
                {hasProviders && (
                    <KeycloakDataTable
                        key={key}
                        loader={loader}
                        isPaginated
                        ariaLabelKey="identityProviders"
                        searchPlaceholderKey="searchForProvider"
                        toolbarItem={
                            <>
                                <div className="flex items-center">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="hideOrganizationLinkedIdps"
                                            data-testid="hideOrganizationLinkedIdps"
                                            checked={hide}
                                            onCheckedChange={(check) => {
                                                setHide(!!check);
                                                refresh();
                                            }}
                                        />
                                        <label htmlFor="hideOrganizationLinkedIdps">{t("hideOrganizationLinkedIdps")}</label>
                                    </div>
                                </div>
                                <div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                data-testid="addProviderDropdown"
                                            >
                                                {t("addProvider")}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            {identityProviderOptions()}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
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
                                title: t("delete"),
                                onRowClick: provider => {
                                    setSelectedProvider(provider);
                                    toggleDeleteDialog();
                                }
                            } as Action<IdentityProviderRepresentation>
                        ]}
                        columns={[
                            {
                                name: "alias",
                                displayKey: "name",
                                cellRenderer: DetailLink
                            },
                            {
                                name: "providerId",
                                displayKey: "providerDetails",
                                cellFormatters: [upperCaseFormatter()]
                            },
                            {
                                name: "organizationId",
                                displayKey: "linkedOrganization",
                                cellRenderer: OrganizationLink
                            }
                        ]}
                        emptyState={
                            <ListEmptyState
                                message={t("identityProviders")}
                                instructions={t("emptyRealmBasedIdps")}
                                isSearchVariant
                                secondaryActions={[
                                    {
                                        text: t("clearAllFilters"),
                                        onClick: () => {
                                            setHide(false);
                                            refresh();
                                        },
                                        type: "link"
                                    }
                                ]}
                            />
                        }
                    />
                )}
            </div>
        </>
    );
}
