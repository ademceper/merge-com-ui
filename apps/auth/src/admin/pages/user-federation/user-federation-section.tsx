import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { Database, Trash } from "@phosphor-icons/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    type ColumnDef,
    DataTable,
    DataTableRowActions
} from "@/admin/shared/ui/data-table";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { useServerInfo } from "../../app/providers/server-info/server-info-provider";
import {
    toCustomUserFederation,
    toNewCustomUserFederation,
    toUserFederationKerberos,
    toUserFederationLdap
} from "../../shared/lib/routes/user-federation";
import { toUpperCase } from "../../shared/lib/util";
import { ClickableCard } from "../../shared/ui/keycloak-card/clickable-card";
import { useDeleteComponent } from "./hooks/use-delete-component";
import { useUserFederationList } from "./hooks/use-user-federation-list";
import { ManagePriorityDialog } from "./manage-priority-dialog";

export function UserFederationSection() {
    const { t } = useTranslation();
    const { realm, realmRepresentation } = useRealm();
    const navigate = useNavigate();

    const [manageDisplayDialog, setManageDisplayDialog] = useState(false);
    const [selectedComponent, setSelectedComponent] = useState<ComponentRepresentation>();

    const providers =
        useServerInfo().componentTypes?.["org.keycloak.storage.UserStorageProvider"] ??
        [];

    const { data: userFederations = [] } = useUserFederationList(realmRepresentation?.id);
    const { mutateAsync: deleteComponentMut } = useDeleteComponent();

    const toDetails = useCallback(
        (providerId: string, id: string) => {
            switch (providerId) {
                case "ldap":
                    return toUserFederationLdap({ realm, id });
                case "kerberos":
                    return toUserFederationKerberos({ realm, id });
                default:
                    return toCustomUserFederation({ realm, providerId, id });
            }
        },
        [realm]
    );

    const onDeleteConfirm = async () => {
        if (!selectedComponent?.id) return;
        try {
            await deleteComponentMut(selectedComponent.id);
            setSelectedComponent(undefined);
            toast.success(t("userFedDeletedSuccess"));
        } catch (error) {
            toast.error(
                t("userFedDeleteError", {
                    error: getErrorMessage(error)
                }),
                { description: getErrorDescription(error) }
            );
        }
    };

    const sortedFederations = useMemo(
        () =>
            [...userFederations].sort((a, b) =>
                (a.name ?? "").localeCompare(b.name ?? "")
            ),
        [userFederations]
    );

    const columns: ColumnDef<ComponentRepresentation>[] = useMemo(
        () => [
            {
                accessorKey: "name",
                header: t("name"),
                cell: ({ row }) => {
                    const c = row.original;
                    const href = toDetails(c.providerId!, c.id!);
                    return (
                        <Link
                            to={href as string}
                            className="font-medium text-primary hover:underline"
                        >
                            {c.name ?? "-"}
                        </Link>
                    );
                }
            },
            {
                accessorKey: "providerId",
                header: t("providerDetails"),
                cell: ({ row }) => toUpperCase(row.original.providerId ?? "") || "-"
            },
            {
                id: "status",
                accessorKey: "config",
                header: t("status"),
                cell: ({ row }) => {
                    const enabled = row.original.config?.enabled?.[0] !== "false";
                    return (
                        <Badge variant={enabled ? "default" : "secondary"}>
                            {enabled ? t("enabled") : t("disabled")}
                        </Badge>
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
                            onClick={() => setSelectedComponent(row.original)}
                        >
                            <Trash className="size-4 shrink-0" />
                            {t("delete")}
                        </button>
                    </DataTableRowActions>
                )
            }
        ],
        [t, toDetails]
    );

    const addProviderDropdownItems = useMemo(
        () =>
            providers.map(p => (
                <DropdownMenuItem
                    key={p.id}
                    data-testid={p.id}
                    onClick={() =>
                        navigate({
                            to: toNewCustomUserFederation({
                                realm,
                                providerId: p.id!
                            }) as string
                        })
                    }
                >
                    {p.id?.toUpperCase() === "LDAP"
                        ? p.id.toUpperCase()
                        : toUpperCase(p.id)}
                </DropdownMenuItem>
            )),
        [providers, realm, navigate]
    );

    return (
        <>
            <AlertDialog
                open={!!selectedComponent}
                onOpenChange={open => !open && setSelectedComponent(undefined)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("userFedDeleteConfirmTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("userFedDeleteConfirm")}
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
            {manageDisplayDialog && userFederations.length > 0 && (
                <ManagePriorityDialog
                    onClose={() => setManageDisplayDialog(false)}
                    components={userFederations.filter(
                        p => p.config?.enabled?.[0] !== "false"
                    )}
                />
            )}
            <div className="space-y-4 py-6">
                {userFederations.length > 0 ? (
                    <DataTable<ComponentRepresentation>
                        columns={columns}
                        data={sortedFederations}
                        searchColumnId="name"
                        searchPlaceholder={t("searchForProvider")}
                        emptyMessage={t("noUserFederationProviders")}
                        toolbar={
                            <div className="flex flex-wrap items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            data-testid="addProviderDropdown"
                                            variant="default"
                                            size="sm"
                                        >
                                            {t("addNewProvider")}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {addProviderDropdownItems}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button
                                    data-testid="managePriorities"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setManageDisplayDialog(true)}
                                >
                                    {t("managePriorities")}
                                </Button>
                            </div>
                        }
                    />
                ) : (
                    <div className="p-6">
                        <p className="text-muted-foreground">{t("getStarted")}</p>
                        <h2 className="mt-6 text-lg font-semibold">
                            {t("add-providers")}
                        </h2>
                        <hr className="my-4 border-border" />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {providers.map(p => (
                                <ClickableCard
                                    key={p.id}
                                    data-testid={`${p.id}-card`}
                                    onClick={() =>
                                        navigate({
                                            to: toNewCustomUserFederation({
                                                realm,
                                                providerId: p.id!
                                            }) as string
                                        })
                                    }
                                >
                                    <CardTitle className="flex items-center gap-2">
                                        <Database className="size-6 shrink-0" />
                                        <span>
                                            {t("addProvider", {
                                                provider: toUpperCase(p.id!),
                                                count: 4
                                            })}
                                        </span>
                                    </CardTitle>
                                </ClickableCard>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
