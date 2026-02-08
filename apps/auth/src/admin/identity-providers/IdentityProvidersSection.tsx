import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import type { IdentityProvidersQuery } from "@keycloak/keycloak-admin-client/lib/resources/identityProviders";
import { getErrorDescription, getErrorMessage } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Badge } from "@merge/ui/components/badge";
import { Button } from "@merge/ui/components/button";
import { Checkbox } from "@merge/ui/components/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@merge/ui/components/dropdown-menu";
import {
    DataTable,
    DataTableRowActions,
    type ColumnDef,
} from "@merge/ui/components/table";
import { CardTitle } from "@merge/ui/components/card";
import {
    Cube,
    FacebookLogo,
    GithubLogo,
    GitlabLogo,
    GoogleLogo,
    InstagramLogo,
    LinkedinLogo,
    PaypalLogo,
    StackOverflowLogo,
    TwitterLogo,
} from "@phosphor-icons/react";
import { groupBy, sortBy } from "lodash-es";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
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
import { Trash } from "@phosphor-icons/react";

function getIdpIcon(iconId: string) {
    switch (iconId) {
        case "github":
            return GithubLogo;
        case "facebook":
            return FacebookLogo;
        case "gitlab":
            return GitlabLogo;
        case "google":
            return GoogleLogo;
        case "linkedin":
        case "linkedin-openid-connect":
            return LinkedinLogo;
        case "openshift-v4":
            return Cube;
        case "stackoverflow":
            return StackOverflowLogo;
        case "twitter":
            return TwitterLogo;
        case "microsoft":
        case "bitbucket":
            return Cube;
        case "instagram":
            return InstagramLogo;
        case "paypal":
            return PaypalLogo;
        default:
            return Cube;
    }
}

export default function IdentityProvidersSection() {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const identityProviders = groupBy(useServerInfo().identityProviders, "groupName");
    const { realm } = useRealm();
    const navigate = useNavigate();

    const [key, setKey] = useState(0);
    const refresh = useCallback(() => setKey((k) => k + 1), []);
    const [hide, setHide] = useState(false);
    const [manageDisplayDialog, setManageDisplayDialog] = useState(false);
    const [hasProviders, setHasProviders] = useState(false);
    const [providers, setProviders] = useState<IdentityProviderRepresentation[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<IdentityProviderRepresentation>();

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [firstPage, list] = await Promise.all([
                    adminClient.identityProviders.find({ max: 1 }),
                    adminClient.identityProviders.find({
                        first: 0,
                        max: 1000,
                        realmOnly: hide,
                    } as IdentityProvidersQuery),
                ]);
                if (cancelled) return;
                setHasProviders((firstPage?.length ?? 0) > 0);
                setProviders(list ?? []);
            } catch {
                if (!cancelled) {
                    setHasProviders(false);
                    setProviders([]);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [key, hide, adminClient]);

    const navigateToCreate = (providerId: string) =>
        navigate(toIdentityProviderCreate({ realm, providerId }));

    const identityProviderOptions = () =>
        Object.keys(identityProviders).map((group) => (
            <DropdownMenuGroup key={group}>
                <DropdownMenuLabel>{group}</DropdownMenuLabel>
                {sortBy(identityProviders[group], "name").map((provider) => (
                    <DropdownMenuItem
                        key={provider.id}
                        data-testid={provider.id}
                        onClick={() =>
                            navigate(
                                toIdentityProviderCreate({
                                    realm,
                                    providerId: provider.id,
                                }),
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
                    alias: selectedProvider!.alias!,
                });
                refresh();
                toast.success(t("deletedSuccessIdentityProvider"));
            } catch (error) {
                toast.error(
                    t("deleteErrorIdentityProvider", {
                        error: getErrorMessage(error),
                    }),
                    { description: getErrorDescription(error) },
                );
            }
        },
    });

    const columns: ColumnDef<IdentityProviderRepresentation>[] = useMemo(
        () => [
            {
                accessorKey: "alias",
                header: t("name"),
                cell: ({ row }) => {
                    const idp = row.original;
                    return (
                        <Link
                            to={toIdentityProvider({
                                realm,
                                providerId: idp.providerId!,
                                alias: idp.alias!,
                                tab: "settings",
                            })}
                            className="font-medium text-primary hover:underline"
                        >
                            {idp.displayName || idp.alias}
                            {!idp.enabled && (
                                <Badge
                                    variant="secondary"
                                    className="ml-2"
                                >
                                    {t("disabled")}
                                </Badge>
                            )}
                        </Link>
                    );
                },
            },
            {
                accessorKey: "providerId",
                header: t("providerDetails"),
                cell: ({ row }) =>
                    upperCaseFormatter()(row.original.providerId) ?? "-",
            },
            {
                accessorKey: "organizationId",
                header: t("linkedOrganization"),
                cell: ({ row }) => {
                    const idp = row.original;
                    if (!idp?.organizationId) return "—";
                    return (
                        <Link
                            to={toEditOrganization({
                                realm,
                                id: idp.organizationId,
                                tab: "identityProviders",
                            })}
                            className="text-primary hover:underline"
                        >
                            {t("organization")}
                        </Link>
                    );
                },
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
                            className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => {
                                setSelectedProvider(row.original);
                                toggleDeleteDialog();
                            }}
                        >
                            <Trash className="size-4 shrink-0" />
                            {t("delete")}
                        </button>
                    </DataTableRowActions>
                ),
            },
        ],
        [t, realm, toggleDeleteDialog],
    );

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
            <div className="space-y-4 py-6">
                {!hasProviders && (
                    <div className="p-6">
                        <p className="text-muted-foreground">{t("getStarted")}</p>
                        {Object.keys(identityProviders).map((group) => (
                            <Fragment key={group}>
                                <h2 className="mt-6 text-sm font-medium">
                                    {group}:
                                </h2>
                                <hr className="my-4 border-border" />
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                    {sortBy(identityProviders[group], "name").map(
                                        (provider) => (
                                            <ClickableCard
                                                key={provider.id}
                                                data-testid={`${provider.id}-card`}
                                                onClick={() =>
                                                    navigateToCreate(provider.id)
                                                }
                                            >
                                                <CardTitle>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="inline-flex items-center justify-center [&_svg]:size-6"
                                                            aria-hidden
                                                        >
                                                            {(() => {
                                                                const Icon =
                                                                    getIdpIcon(
                                                                        provider.id ?? "",
                                                                    );
                                                                return (
                                                                    <Icon
                                                                        size={24}
                                                                    />
                                                                );
                                                            })()}
                                                        </div>
                                                        <div className="flex-1">
                                                            {provider.name}
                                                        </div>
                                                    </div>
                                                </CardTitle>
                                            </ClickableCard>
                                        ),
                                    )}
                                </div>
                            </Fragment>
                        ))}
                    </div>
                )}
                {hasProviders && (
                    <DataTable<IdentityProviderRepresentation>
                        columns={columns}
                        data={providers}
                        searchColumnId="alias"
                        searchPlaceholder={t("searchForProvider")}
                        emptyMessage={t("emptyRealmBasedIdps")}
                        toolbar={
                            <div className="flex flex-wrap items-center gap-2">
                                <label className="flex cursor-pointer items-center gap-2 text-sm">
                                    <Checkbox
                                        id="hideOrganizationLinkedIdps"
                                        data-testid="hideOrganizationLinkedIdps"
                                        checked={hide}
                                        onCheckedChange={(checked) => {
                                            setHide(!!checked);
                                            refresh();
                                        }}
                                    />
                                    {t("hideOrganizationLinkedIdps")}
                                </label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            data-testid="addProviderDropdown"
                                            variant="default"
                                            size="sm"
                                        >
                                            {t("addProvider")}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {identityProviderOptions()}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button
                                    data-testid="manageDisplayOrder"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        setManageDisplayDialog(true)
                                    }
                                >
                                    {t("manageDisplayOrder")}
                                </Button>
                            </div>
                        }
                    />
                )}
            </div>
        </>
    );
}
