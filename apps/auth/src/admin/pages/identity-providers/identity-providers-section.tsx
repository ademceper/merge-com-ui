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
import { Badge } from "@merge-rd/ui/components/badge";
import { Button } from "@merge-rd/ui/components/button";
import { CardTitle } from "@merge-rd/ui/components/card";
import { Checkbox } from "@merge-rd/ui/components/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { Input } from "@merge-rd/ui/components/input";
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
    Trash,
    TwitterLogo
} from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { groupBy, sortBy } from "lodash-es";
import type { SetStateAction } from "react";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { type ColumnDef, DataTableRowActions } from "@/admin/shared/ui/data-table";
import { DraggableTableRows } from "@/admin/shared/ui/table-draggable-rows";
import { getErrorDescription, getErrorMessage } from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { useServerInfo } from "@/admin/app/providers/server-info/server-info-provider";
import {
    toIdentityProvider,
    toIdentityProviderCreate
} from "@/admin/shared/lib/routes/identity-providers";
import { toEditOrganization } from "@/admin/shared/lib/routes/organizations";
import { upperCaseFormatter } from "@/admin/shared/lib/util";
import { ClickableCard } from "@/admin/shared/ui/keycloak-card/clickable-card";
import { idpKeys } from "./hooks/keys";
import { useDeleteIdentityProvider } from "./hooks/use-delete-identity-provider";
import { useIdentityProvidersList } from "./hooks/use-identity-providers-list";
import { useUpdateIdentityProviderOrder } from "./hooks/use-update-identity-provider-order";

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

export function IdentityProvidersSection() {
    const { t } = useTranslation();
    const identityProviders = groupBy(useServerInfo().identityProviders, "groupName");
    const { realm } = useRealm();
    const navigate = useNavigate();

    const queryClient = useQueryClient();
    const [hide, setHide] = useState(false);
    const { data } = useIdentityProvidersList(hide);
    const { mutateAsync: deleteIdp } = useDeleteIdentityProvider();
    const { mutateAsync: updateOrder } = useUpdateIdentityProviderOrder();
    const invalidateIdps = () => queryClient.invalidateQueries({ queryKey: idpKeys.all });
    const hasProviders = data?.hasProviders ?? false;
    const [providers, setProviders] = useState<IdentityProviderRepresentation[]>([]);
    const [search, setSearch] = useState("");
    const [selectedProvider, setSelectedProvider] =
        useState<IdentityProviderRepresentation>();

    // Sync query data into local state so drag-and-drop reordering works
    useEffect(() => {
        if (data?.providers) {
            setProviders(data.providers);
        }
    }, [data?.providers]);

    const filteredProviders = useMemo(() => {
        if (!search.trim()) return providers;
        const q = search.trim().toLowerCase();
        return providers.filter(
            p =>
                p.alias?.toLowerCase().includes(q) ||
                p.displayName?.toLowerCase().includes(q) ||
                p.providerId?.toLowerCase().includes(q)
        );
    }, [providers, search]);

    const setTableData = useCallback(
        (action: SetStateAction<IdentityProviderRepresentation[]>) => {
            setProviders(current => {
                const next =
                    typeof action === "function" ? action(filteredProviders) : action;
                if (next.length === current.length && current.length > 0) {
                    return next;
                }
                const filteredSet = new Set(next.map(p => p.alias));
                let j = 0;
                return current.map(p => (filteredSet.has(p.alias ?? "") ? next[j++] : p));
            });
        },
        [filteredProviders]
    );

    const handleOrderChange = useCallback(
        async (reorderedData: IdentityProviderRepresentation[]) => {
            const filteredSet = new Set(reorderedData.map(p => p.alias));
            const fullOrder =
                filteredSet.size < providers.length
                    ? (() => {
                          let j = 0;
                          return providers.map(p =>
                              filteredSet.has(p.alias ?? "") ? reorderedData[j++] : p
                          );
                      })()
                    : reorderedData;

            const updates = fullOrder.map((provider, index) => ({
                alias: provider.alias ?? "",
                provider: {
                    ...provider,
                    config: { ...provider.config, guiOrder: String(index) }
                }
            }));
            try {
                await updateOrder(updates);
                toast.success(t("orderChangeSuccess"));
                invalidateIdps();
            } catch (error) {
                toast.error(t("orderChangeError", { error: getErrorMessage(error) }), {
                    description: getErrorDescription(error)
                });
            }
        },
        [t, invalidateIdps, providers, updateOrder]
    );

    const navigateToCreate = (providerId: string) =>
        navigate({ to: toIdentityProviderCreate({ realm, providerId }) as string });

    const identityProviderOptions = () =>
        Object.keys(identityProviders).map(group => (
            <DropdownMenuGroup key={group}>
                <DropdownMenuLabel>{group}</DropdownMenuLabel>
                {sortBy(identityProviders[group], "name").map(provider => (
                    <DropdownMenuItem
                        key={provider.id}
                        data-testid={provider.id}
                        onClick={() =>
                            navigate({
                                to: toIdentityProviderCreate({
                                    realm,
                                    providerId: provider.id
                                }) as string
                            })
                        }
                    >
                        {provider.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuGroup>
        ));

    const onDeleteConfirm = async () => {
        if (!selectedProvider?.alias) return;
        try {
            await deleteIdp(selectedProvider.alias);
            setSelectedProvider(undefined);
            invalidateIdps();
            toast.success(t("deletedSuccessIdentityProvider"));
        } catch (error) {
            toast.error(
                t("deleteErrorIdentityProvider", {
                    error: getErrorMessage(error)
                }),
                { description: getErrorDescription(error) }
            );
        }
    };

    const columns: ColumnDef<IdentityProviderRepresentation>[] = useMemo(
        () => [
            {
                accessorKey: "alias",
                header: t("name"),
                cell: ({ row }) => {
                    const idp = row.original;
                    return (
                        <Link
                            to={
                                toIdentityProvider({
                                    realm,
                                    providerId: idp.providerId ?? "",
                                    alias: idp.alias ?? "",
                                    tab: "settings"
                                }) as string
                            }
                            className="font-medium text-primary hover:underline"
                        >
                            {idp.displayName || idp.alias}
                            {!idp.enabled && (
                                <Badge variant="secondary" className="ml-2">
                                    {t("disabled")}
                                </Badge>
                            )}
                        </Link>
                    );
                }
            },
            {
                accessorKey: "providerId",
                header: t("providerDetails"),
                cell: ({ row }) => upperCaseFormatter()(row.original.providerId) ?? "-"
            },
            {
                accessorKey: "organizationId",
                header: t("linkedOrganization"),
                cell: ({ row }) => {
                    const idp = row.original;
                    if (!idp?.organizationId) return "—";
                    return (
                        <Link
                            to={
                                toEditOrganization({
                                    realm,
                                    id: idp.organizationId,
                                    tab: "identityProviders"
                                }) as string
                            }
                            className="text-primary hover:underline"
                        >
                            {t("organization")}
                        </Link>
                    );
                }
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
                            onClick={() => setSelectedProvider(row.original)}
                        >
                            <Trash className="size-4 shrink-0" />
                            {t("delete")}
                        </button>
                    </DataTableRowActions>
                )
            }
        ],
        [t, realm]
    );

    return (
        <>
            <AlertDialog
                open={!!selectedProvider}
                onOpenChange={open => !open && setSelectedProvider(undefined)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("deleteProvider")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("deleteConfirm", { provider: selectedProvider?.alias })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            data-testid="confirm"
                            onClick={onDeleteConfirm}
                        >
                            {t("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="space-y-4 py-6">
                {!hasProviders && (
                    <div className="p-6">
                        <p className="text-muted-foreground">{t("getStarted")}</p>
                        {Object.keys(identityProviders).map(group => (
                            <Fragment key={group}>
                                <h2 className="mt-6 text-sm font-medium">{group}:</h2>
                                <hr className="my-4 border-border" />
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
                                                        <div
                                                            className="inline-flex items-center justify-center [&_svg]:size-6"
                                                            aria-hidden
                                                        >
                                                            {(() => {
                                                                const Icon = getIdpIcon(
                                                                    provider.id ?? ""
                                                                );
                                                                return <Icon size={24} />;
                                                            })()}
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
                    </div>
                )}
                {hasProviders && (
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <Input
                                placeholder={t("searchForProvider")}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="h-9 w-64"
                            />
                            <label className="flex cursor-pointer items-center gap-2 text-sm">
                                <Checkbox
                                    id="hideOrganizationLinkedIdps"
                                    data-testid="hideOrganizationLinkedIdps"
                                    checked={hide}
                                    onCheckedChange={checked => {
                                        setHide(!!checked);
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
                        </div>
                        <DraggableTableRows<IdentityProviderRepresentation>
                            columns={columns}
                            data={filteredProviders}
                            setData={setTableData}
                            getRowId={row => row.alias ?? row.providerId ?? ""}
                            onOrderChange={handleOrderChange}
                        />
                    </div>
                )}
            </div>
        </>
    );
}
