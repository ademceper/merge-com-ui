import { fetchWithError } from "@keycloak/keycloak-admin-client";
import type RequiredActionProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderRepresentation";
import type RequiredActionProviderSimpleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderSimpleRepresentation";
import {
    getErrorDescription,
    getErrorMessage,
} from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { Switch } from "@merge/ui/components/switch";
import {
    DataTable,
    type ColumnDef,
} from "@merge/ui/components/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@merge/ui/components/tooltip";
import { Gear } from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { KeycloakSpinner } from "../../shared/keycloak-ui-shared";
import { useRealm } from "../context/realm-context/RealmContext";
import { addTrailingSlash, toKey } from "../util";
import { getAuthorizationHeaders } from "../utils/getAuthorizationHeaders";
import { RequiredActionConfigModal } from "./components/RequiredActionConfigModal";

type DataType = RequiredActionProviderRepresentation &
    RequiredActionProviderSimpleRepresentation & {
        configurable?: boolean;
    };

type Row = {
    name?: string;
    enabled: boolean;
    defaultAction: boolean;
    data: DataType;
};

export const RequiredActions = () => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const { realm: realmName } = useRealm();
    const [actions, setActions] = useState<Row[]>();
    const [selectedAction, setSelectedAction] = useState<DataType>();
    const [key, setKey] = useState(0);
    const refresh = useCallback(() => setKey((k) => k + 1), []);

    const loadActions = useCallback(async (): Promise<RequiredActionProviderRepresentation[]> => {
        const requiredActionsRequest = await fetchWithError(
            `${addTrailingSlash(
                adminClient.baseUrl,
            )}admin/realms/${realmName}/ui-ext/authentication-management/required-actions`,
            {
                method: "GET",
                headers: getAuthorizationHeaders(
                    await adminClient.getAccessToken(),
                ),
            },
        );
        return (await requiredActionsRequest.json()) as DataType[];
    }, [adminClient, realmName]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [requiredActions, unregisteredRequiredActions] =
                    await Promise.all([
                        loadActions(),
                        adminClient.authenticationManagement.getUnregisteredRequiredActions(),
                    ]);
                if (cancelled) return;
                const rows: Row[] = [
                    ...requiredActions.map((action) => ({
                        name: action.name!,
                        enabled: action.enabled!,
                        defaultAction: action.defaultAction!,
                        data: action,
                    })),
                    ...unregisteredRequiredActions.map((action) => ({
                        name: action.name!,
                        enabled: false,
                        defaultAction: false,
                        data: action,
                    })),
                ];
                setActions(rows);
            } catch {
                if (!cancelled) setActions([]);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [key, loadActions, adminClient]);

    const isUnregisteredAction = (data: DataType): boolean => {
        return !("alias" in data);
    };

    const updateAction = useCallback(
        async (action: DataType, field: "enabled" | "defaultAction") => {
            try {
                if (field in action) {
                    action[field] = !action[field];
                    delete action.configurable;
                    await adminClient.authenticationManagement.updateRequiredAction(
                        { alias: action.alias! },
                        action,
                    );
                } else if (isUnregisteredAction(action)) {
                    await adminClient.authenticationManagement.registerRequiredAction(
                        {
                            name: action.name,
                            providerId: action.providerId,
                        },
                    );
                }
                refresh();
                toast.success(t("updatedRequiredActionSuccess"));
            } catch (error) {
                toast.error(
                    t("updatedRequiredActionError", {
                        error: getErrorMessage(error),
                    }),
                    { description: getErrorDescription(error) },
                );
            }
        },
        [adminClient, refresh, t],
    );

    const columns: ColumnDef<Row>[] = useMemo(
        () => [
            {
                accessorKey: "name",
                header: t("action"),
                cell: ({ row }) => (
                    <span className="font-medium">
                        {row.original.name ?? "-"}
                    </span>
                ),
            },
            {
                accessorKey: "enabled",
                header: t("enabled"),
                size: 120,
                cell: ({ row }) => (
                    <Switch
                        id={`enable-${toKey(row.original.name ?? "")}`}
                        checked={row.original.enabled}
                        onCheckedChange={async () => {
                            await updateAction(row.original.data, "enabled");
                        }}
                        aria-label={row.original.name}
                    />
                ),
            },
            {
                accessorKey: "defaultAction",
                header: () => (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>{t("setAsDefaultAction")}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                                {t("authDefaultActionTooltip")}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ),
                size: 120,
                cell: ({ row }) => (
                    <Switch
                        id={`default-${toKey(row.original.name ?? "")}`}
                        disabled={!row.original.enabled}
                        checked={row.original.defaultAction}
                        onCheckedChange={async () => {
                            await updateAction(row.original.data, "defaultAction");
                        }}
                        aria-label={row.original.name}
                    />
                ),
            },
            {
                id: "config",
                accessorKey: "data",
                header: t("configure"),
                size: 80,
                cell: ({ row }) =>
                    row.original.data.configurable ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t("settings")}
                            onClick={() =>
                                setSelectedAction(row.original.data)
                            }
                        >
                            <Gear className="size-4" />
                        </Button>
                    ) : (
                        "-"
                    ),
            },
        ],
        [t, updateAction],
    );

    if (!actions) {
        return <KeycloakSpinner />;
    }

    return (
        <>
            {selectedAction && (
                <RequiredActionConfigModal
                    requiredAction={selectedAction}
                    onClose={() => setSelectedAction(undefined)}
                />
            )}
            <div className="space-y-4">
                <DataTable<Row>
                    columns={columns}
                    data={actions}
                    searchColumnId="name"
                    searchPlaceholder={t("searchForAction")}
                    emptyMessage={t("noRequiredActions")}
                />
            </div>
        </>
    );
};
