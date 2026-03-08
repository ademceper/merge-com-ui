import type RequiredActionProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderRepresentation";
import type RequiredActionProviderSimpleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderSimpleRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Switch } from "@merge-rd/ui/components/switch";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@merge-rd/ui/components/tooltip";
import { Gear } from "@phosphor-icons/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { type ColumnDef, DataTable } from "@/admin/shared/ui/data-table";
import {
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner
} from "../../../shared/keycloak-ui-shared";
import { toKey } from "../../shared/lib/util";
import { useRequiredActions as useRequiredActionsQuery } from "./hooks/use-required-actions";
import { useUpdateRequiredAction } from "./hooks/use-update-required-action";
import { RequiredActionConfigModal } from "./components/required-action-config-modal";

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
    const { t } = useTranslation();
    const [selectedAction, setSelectedAction] = useState<DataType>();

    const { data: actions, isLoading } = useRequiredActionsQuery();
    const { mutateAsync: updateRequiredAction } = useUpdateRequiredAction();

    const updateAction = useCallback(
        async (action: DataType, field: "enabled" | "defaultAction") => {
            try {
                await updateRequiredAction({ action, field });
                toast.success(t("updatedRequiredActionSuccess"));
            } catch (error) {
                toast.error(
                    t("updatedRequiredActionError", {
                        error: getErrorMessage(error)
                    }),
                    { description: getErrorDescription(error) }
                );
            }
        },
        [updateRequiredAction, t]
    );

    const columns: ColumnDef<Row>[] = useMemo(
        () => [
            {
                accessorKey: "name",
                header: t("action"),
                cell: ({ row }) => (
                    <span className="font-medium">{row.original.name ?? "-"}</span>
                )
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
                )
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
                )
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
                            onClick={() => setSelectedAction(row.original.data)}
                        >
                            <Gear className="size-4" />
                        </Button>
                    ) : (
                        "-"
                    )
            }
        ],
        [t, updateAction]
    );

    if (isLoading || !actions) {
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
