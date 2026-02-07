import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import type ComponentTypeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentTypeRepresentation";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import {
    DataTable,
    DataTableRowActions,
    type ColumnDef
} from "@merge/ui/components/table";
import { Plus, Trash } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { useRealm } from "../../context/realm-context/RealmContext";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";
import { KEY_PROVIDER_TYPE } from "../../util";
import useToggle from "../../utils/useToggle";
import { ProviderType, toKeyProvider } from "../routes/KeyProvider";
import { KeyProviderModal } from "./key-providers/KeyProviderModal";
import { KeyProvidersPicker } from "./key-providers/KeyProvidersPicker";

type ComponentData = ComponentRepresentation & {
    providerDescription?: string;
};

type KeysProvidersTabProps = {
    realmComponents: ComponentRepresentation[];
    refresh: () => void;
};

export const KeysProvidersTab = ({ realmComponents, refresh }: KeysProvidersTabProps) => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const { realm } = useRealm();

    const [isCreateModalOpen, handleModalToggle] = useToggle();
    const serverInfo = useServerInfo();
    const keyProviderComponentTypes =
        serverInfo.componentTypes?.[KEY_PROVIDER_TYPE] ?? [];

    const [providerOpen, toggleProviderOpen] = useToggle();
    const [defaultUIDisplayName, setDefaultUIDisplayName] = useState<ProviderType>();
    const [selectedComponent, setSelectedComponent] = useState<ComponentRepresentation>();

    const data = useMemo(
        () =>
            realmComponents.map(component => {
                const provider = keyProviderComponentTypes.find(
                    (ct: ComponentTypeRepresentation) =>
                        component.providerId === ct.id
                );
                return {
                    ...component,
                    providerDescription: provider?.helpText
                } as ComponentData;
            }),
        [realmComponents, keyProviderComponentTypes]
    );

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "deleteProviderTitle",
        messageKey: t("deleteProviderConfirm", {
            provider: selectedComponent?.name
        }),
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await adminClient.components.del({
                    id: selectedComponent!.id!,
                    realm: realm
                });
                refresh();
                toast.success(t("deleteProviderSuccess"));
            } catch (error) {
                toast.error(t("deleteProviderError", { error: getErrorMessage(error) }), {
                    description: getErrorDescription(error)
                });
            }
        }
    });

    const columns: ColumnDef<ComponentData>[] = [
        {
            accessorKey: "name",
            header: t("name"),
            cell: ({ row }) => (
                <Link
                    to={toKeyProvider({
                        realm,
                        id: row.original.id!,
                        providerType: row.original.providerId as ProviderType
                    })}
                    className="text-primary hover:underline"
                    data-testid="provider-name-link"
                >
                    {row.original.name}
                </Link>
            )
        },
        {
            accessorKey: "providerId",
            header: t("provider"),
            cell: ({ row }) => row.original.providerId ?? "-"
        },
        {
            accessorKey: "providerDescription",
            header: t("providerDescription"),
            cell: ({ row }) => row.original.providerDescription ?? "-"
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
                            setSelectedComponent(row.original);
                            toggleDeleteDialog();
                        }}
                    >
                        <Trash className="size-4 shrink-0" />
                        {t("delete")}
                    </button>
                </DataTableRowActions>
            )
        }
    ];

    return (
        <>
            {providerOpen && (
                <KeyProvidersPicker
                    onClose={() => toggleProviderOpen()}
                    onConfirm={provider => {
                        handleModalToggle();
                        setDefaultUIDisplayName(provider as ProviderType);
                        toggleProviderOpen();
                    }}
                />
            )}
            {isCreateModalOpen && defaultUIDisplayName && (
                <KeyProviderModal
                    providerType={defaultUIDisplayName}
                    onClose={() => {
                        handleModalToggle();
                        refresh();
                    }}
                />
            )}
            <DeleteConfirm />
            <DataTable
                columns={columns}
                data={data}
                searchColumnId="name"
                searchPlaceholder={t("search")}
                emptyMessage={t("noProviders")}
                toolbar={
                    <Button
                        type="button"
                        data-testid="addProviderDropdown"
                        variant="default"
                        className="flex h-9 w-9 shrink-0 items-center justify-center p-0 sm:h-9 sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
                        aria-label={t("addProvider")}
                        onClick={() => toggleProviderOpen()}
                    >
                        <Plus size={20} className="shrink-0 sm:hidden" />
                        <span className="hidden sm:inline">{t("addProvider")}</span>
                    </Button>
                }
            />
        </>
    );
};
