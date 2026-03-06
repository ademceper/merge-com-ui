import { fetchWithError } from "@keycloak/keycloak-admin-client";
import {
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner,
} from "../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import { Button } from "@merge-rd/ui/components/button";
import { Label } from "@merge-rd/ui/components/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge-rd/ui/components/tabs";
import {
    DataTable,
    DataTableRowActions,
    type ColumnDef,
} from "@/admin/components/data-table";
import { Copy, Link as LinkIcon, Trash } from "@phosphor-icons/react";
import { sortBy } from "lodash-es";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link, useParams, useNavigate } from "react-router-dom";
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
} from "@merge-rd/ui/components/alert-dialog";
import { ViewHeader } from "../components/view-header/view-header";
import { useRealm } from "../context/realm-context/realm-context";
import helpUrls from "../help-urls";
import { addTrailingSlash } from "../util";
import { getAuthorizationHeaders } from "../utils/getAuthorizationHeaders";
import useToggle from "../utils/useToggle";
import { BindFlowDialog } from "./bind-flow-dialog";
import { DuplicateFlowModal } from "./duplicate-flow-modal";
import { RequiredActions } from "./required-actions";
import { UsedBy } from "./components/used-by";
import { AuthenticationType } from "./constants";
import { Policies } from "./policies/policies";
import { toAuthentication } from "./routes/authentication";
import type { AuthenticationTab } from "./routes/authentication";
import { toCreateFlow } from "./routes/create-flow";
import { toFlow } from "./routes/flow";

export default function AuthenticationSection() {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const { realm: realmName, realmRepresentation: realm } = useRealm();
    const { tab } = useParams<{ tab?: string }>();
    const navigate = useNavigate();
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
                                    realm: realmName!,
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

    const currentTab: AuthenticationTab = tab === "required-actions" || tab === "policies" ? tab : "flows";

    return (
        <>
            <ViewHeader
                titleKey="titleAuthentication"
                subKey="authenticationExplain"
                helpUrl={helpUrls.authenticationUrl}
                divider={false}
            />
            <div className="p-0">
                <Tabs
                    value={currentTab}
                    onValueChange={(value) =>
                        navigate(toAuthentication({ realm: realmName, tab: value === "flows" ? undefined : value as AuthenticationTab }))
                    }
                >
                    <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden mb-4">
                        <TabsList variant="line" className="mb-0 w-max min-w-0 **:data-[slot=tabs-trigger]:flex-none">
                            <TabsTrigger value="flows" data-testid="authentication-flows-tab">
                                {t("flows")}
                            </TabsTrigger>
                            <TabsTrigger value="required-actions" data-testid="authentication-required-actions-tab">
                                {t("requiredActions")}
                            </TabsTrigger>
                            <TabsTrigger value="policies" data-testid="authentication-policies-tab">
                                {t("policies")}
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="flows" className="mt-0 pt-0 outline-none">
                        {renderContent()}
                    </TabsContent>
                    <TabsContent value="required-actions" className="mt-0 pt-0 outline-none">
                        {renderContent()}
                    </TabsContent>
                    <TabsContent value="policies" className="mt-0 pt-0 outline-none">
                        {renderContent()}
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
