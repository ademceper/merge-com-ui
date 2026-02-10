import { fetchWithError } from "@keycloak/keycloak-admin-client";
import {
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner,
} from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { Label } from "@merge/ui/components/label";
import {
    DataTable,
    DataTableRowActions,
    type ColumnDef,
} from "@merge/ui/components/table";
import { Copy, Link as LinkIcon, Trash } from "@phosphor-icons/react";
import { sortBy } from "lodash-es";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
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
import { ViewHeader } from "../components/view-header/ViewHeader";
import { useRealm } from "../context/realm-context/RealmContext";
import helpUrls from "../help-urls";
import { addTrailingSlash } from "../util";
import { getAuthorizationHeaders } from "../utils/getAuthorizationHeaders";
import useToggle from "../utils/useToggle";
import { BindFlowDialog } from "./BindFlowDialog";
import { DuplicateFlowModal } from "./DuplicateFlowModal";
import { RequiredActions } from "./RequiredActions";
import { UsedBy } from "./components/UsedBy";
import { AuthenticationType } from "./constants";
import { Policies } from "./policies/Policies";
import { toCreateFlow } from "./routes/CreateFlow";
import { toFlow } from "./routes/Flow";

export default function AuthenticationSection() {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const { realm: realmName, realmRepresentation: realm } = useRealm();
    const { tab } = useParams<{ tab?: string }>();
    const [key, setKey] = useState(0);
    const refresh = useCallback(() => setKey((k) => k + 1), []);
    const [selectedFlow, setSelectedFlow] = useState<AuthenticationType>();
    const [flowToDelete, setFlowToDelete] = useState<AuthenticationType>();
    const [open, toggleOpen] = useToggle();
    const [bindFlowOpen, toggleBindFlow] = useToggle();
    const [flows, setFlows] = useState<AuthenticationType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (tab === "required-actions" || tab === "policies") {
            setFlows([]);
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        (async () => {
            try {
                const flowsRequest = await fetchWithError(
                    `${addTrailingSlash(
                        adminClient.baseUrl,
                    )}admin/realms/${realmName}/ui-ext/authentication-management/flows`,
                    {
                        method: "GET",
                        headers: getAuthorizationHeaders(
                            await adminClient.getAccessToken(),
                        ),
                    },
                );
                const data = await flowsRequest.json();
                if (cancelled) return;
                if (!data) {
                    setFlows([]);
                    return;
                }
                const sorted = sortBy(
                    [...data].sort((a, b) =>
                        (a.alias ?? "").localeCompare(b.alias ?? ""),
                    ),
                    (flow) => flow.usedBy?.type,
                );
                if (!cancelled) setFlows(sorted);
            } catch {
                if (!cancelled) setFlows([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [key, tab, realmName, adminClient]);

    const onDeleteFlowConfirm = async () => {
        if (!flowToDelete?.id) return;
        try {
            await adminClient.authenticationManagement.deleteFlow({
                flowId: flowToDelete.id,
            });
            setFlowToDelete(undefined);
            refresh();
            toast.success(t("deleteFlowSuccess"));
        } catch (error) {
            toast.error(
                t("deleteFlowError", { error: getErrorMessage(error) }),
                { description: getErrorDescription(error) },
            );
        }
    };

    const columns: ColumnDef<AuthenticationType>[] = useMemo(
        () => [
            {
                id: "alias",
                accessorKey: "alias",
                header: t("flowName"),
                cell: ({ row }) => {
                    const flow = row.original;
                    return (
                        <>
                            <Link
                                to={toFlow({
                                    realm: realm!,
                                    id: flow.id!,
                                    usedBy: flow.usedBy?.type || "notInUse",
                                    builtIn: flow.builtIn ? "builtIn" : undefined,
                                })}
                                className="text-primary hover:underline"
                            >
                                {flow.alias}
                            </Link>{" "}
                            {flow.builtIn && (
                                <Label>{t("buildIn")}</Label>
                            )}
                        </>
                    );
                },
            },
            {
                id: "usedBy",
                accessorKey: "usedBy",
                header: t("usedBy"),
                cell: ({ row }) => <UsedBy authType={row.original} />,
            },
            {
                accessorKey: "description",
                header: t("description"),
                cell: ({ row }) => row.original.description ?? "-",
            },
            {
                id: "actions",
                header: "",
                size: 50,
                enableHiding: false,
                cell: ({ row }) => {
                    const data = row.original;
                    return (
                        <DataTableRowActions row={row}>
                            <button
                                type="button"
                                className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                onClick={() => {
                                    setSelectedFlow(data);
                                    toggleOpen();
                                }}
                            >
                                <Copy className="size-4 shrink-0" />
                                {t("duplicate")}
                            </button>
                            {data.usedBy?.type !== "DEFAULT" && (
                                <button
                                    type="button"
                                    className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                    onClick={() => {
                                        setSelectedFlow(data);
                                        toggleBindFlow();
                                    }}
                                >
                                    <LinkIcon className="size-4 shrink-0" />
                                    {t("bindFlow")}
                                </button>
                            )}
                            {!data.builtIn && !data.usedBy && (
                                <>
                                    <div className="my-1 h-px bg-border" />
                                    <button
                                        type="button"
                                        className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => setFlowToDelete(data)}
                                    >
                                        <Trash className="size-4 shrink-0" />
                                        {t("delete")}
                                    </button>
                                </>
                            )}
                        </DataTableRowActions>
                    );
                },
            },
        ],
        [t, realm, toggleOpen, toggleBindFlow],
    );

    if (!realm) return <KeycloakSpinner />;

    const renderContent = () => {
        switch (tab) {
            case "required-actions":
                return <RequiredActions />;
            case "policies":
                return <Policies />;
            default:
                return (
                    <>
                        <AlertDialog open={!!flowToDelete} onOpenChange={(open) => !open && setFlowToDelete(undefined)}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t("deleteConfirmFlow")}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        <Trans i18nKey="deleteConfirmFlowMessage">
                                            {" "}
                                            <strong>{{ flow: flowToDelete?.alias ?? "" }}</strong>.
                                        </Trans>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                                    <AlertDialogAction variant="destructive" data-testid="confirm" onClick={onDeleteFlowConfirm}>
                                        {t("delete")}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        {open && selectedFlow && (
                            <DuplicateFlowModal
                                name={selectedFlow.alias!}
                                description={selectedFlow.description!}
                                toggleDialog={toggleOpen}
                                onComplete={() => {
                                    refresh();
                                    toggleOpen();
                                }}
                            />
                        )}
                        {bindFlowOpen && (
                            <BindFlowDialog
                                onClose={() => {
                                    toggleBindFlow();
                                    refresh();
                                }}
                                flowAlias={selectedFlow?.alias!}
                            />
                        )}
                        {loading ? (
                            <KeycloakSpinner />
                        ) : (
                            <div className="space-y-4">
                                <DataTable<AuthenticationType>
                                    key={key}
                                    columns={columns}
                                    data={flows}
                                    searchColumnId="alias"
                                    searchPlaceholder={t("searchForFlow")}
                                    emptyMessage={t("emptyEvents")}
                                    toolbar={
                                        <Button
                                            asChild
                                            variant="default"
                                            className="flex h-9 w-9 shrink-0 items-center justify-center p-0 sm:h-9 sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
                                        >
                                            <Link
                                                to={toCreateFlow({
                                                    realm: realmName,
                                                })}
                                            >
                                                {t("createFlow")}
                                            </Link>
                                        </Button>
                                    }
                                />
                            </div>
                        )}
                    </>
                );
        }
    };

    return (
        <>
            <ViewHeader
                titleKey="titleAuthentication"
                subKey="authenticationExplain"
                helpUrl={helpUrls.authenticationUrl}
                divider={false}
            />
            <div className="p-0">
                {renderContent()}
            </div>
        </>
    );
}
