/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/keys/KeysProvidersTab.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import type ComponentTypeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentTypeRepresentation";
import type { KeyMetadataRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/keyMetadataRepresentation";
import { useAlerts, AlertVariant } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Input } from "@merge/ui/components/input";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { KeyboardEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { DraggableTable } from "../../authentication/components/DraggableTable";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { useRealm } from "../../context/realm-context/RealmContext";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";
import { KEY_PROVIDER_TYPE } from "../../util";
import useToggle from "../../utils/useToggle";
import { ProviderType, toKeyProvider } from "../routes/KeyProvider";
import { KeyProviderModal } from "./key-providers/KeyProviderModal";
import { KeyProvidersPicker } from "./key-providers/KeyProvidersPicker";


type ComponentData = KeyMetadataRepresentation & {
    id?: string;
    providerDescription?: string;
    name?: string;
    toggleHidden?: boolean;
    config?: any;
    parentId?: string;
};

type KeysProvidersTabProps = {
    realmComponents: ComponentRepresentation[];
    refresh: () => void;
};

export const KeysProvidersTab = ({ realmComponents, refresh }: KeysProvidersTabProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { addAlert, addError } = useAlerts();
    const { realm } = useRealm();

    const [searchVal, setSearchVal] = useState("");
    const [filteredComponents, setFilteredComponents] = useState<ComponentData[]>([]);

    const [isCreateModalOpen, handleModalToggle] = useToggle();
    const serverInfo = useServerInfo();
    const keyProviderComponentTypes =
        serverInfo.componentTypes?.[KEY_PROVIDER_TYPE] ?? [];

    const [providerOpen, toggleProviderOpen] = useToggle();
    const [defaultUIDisplayName, setDefaultUIDisplayName] = useState<ProviderType>();

    const [selectedComponent, setSelectedComponent] = useState<ComponentRepresentation>();

    const components = useMemo(
        () =>
            realmComponents.map(component => {
                const provider = keyProviderComponentTypes.find(
                    (componentType: ComponentTypeRepresentation) =>
                        component.providerId === componentType.id
                );

                return {
                    ...component,
                    providerDescription: provider?.helpText
                };
            }),
        [realmComponents]
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

                addAlert(t("deleteProviderSuccess"), AlertVariant.success);
            } catch (error) {
                addError("deleteProviderError", error);
            }
        }
    });

    const onSearch = () => {
        if (searchVal !== "") {
            setSearchVal(searchVal);
            const filteredComponents = components.filter(
                component =>
                    component.name?.includes(searchVal) ||
                    component.providerId?.includes(searchVal)
            );
            setFilteredComponents(filteredComponents);
        } else {
            setSearchVal("");
            setFilteredComponents(components);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSearch();
        }
    };

    const handleInputChange = (value: string) => {
        setSearchVal(value);
    };

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
            <section className="py-6 bg-muted/30 p-0">
                <div className="flex flex-wrap items-center gap-4 providers-toolbar mb-4">
                    <div className="flex flex-1 min-w-[200px] gap-2">
                        <Input
                            name="inputGroupName"
                            id="inputGroupName"
                            data-testid="provider-search-input"
                            type="search"
                            aria-label={t("search")}
                            placeholder={t("search")}
                            value={searchVal}
                            onChange={(e) => handleInputChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1"
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            aria-label={t("search")}
                            onClick={onSearch}
                        >
                            <MagnifyingGlass className="size-4" />
                        </Button>
                    </div>
                    <Button
                        type="button"
                        data-testid="addProviderDropdown"
                        className="add-provider-dropdown"
                        onClick={() => toggleProviderOpen()}
                    >
                        {t("addProvider")}
                    </Button>
                </div>
                <DraggableTable
                    variant="compact"
                    className="kc-draggable-table"
                    keyField="id"
                    data={
                        filteredComponents.length === 0 ? components : filteredComponents
                    }
                    onDragFinish={async (_, itemOrder) => {
                        const updateAll = components.map((component: ComponentData) => {
                            const componentToSave = { ...component };
                            delete componentToSave.providerDescription;

                            return adminClient.components.update(
                                { id: component.id! },
                                {
                                    ...componentToSave,
                                    config: {
                                        priority: [
                                            (
                                                itemOrder.length -
                                                itemOrder.indexOf(component.id!) +
                                                100
                                            ).toString()
                                        ]
                                    }
                                }
                            );
                        });

                        try {
                            await Promise.all(updateAll);
                            refresh();
                            addAlert(t("saveProviderListSuccess"), AlertVariant.success);
                        } catch (error) {
                            addError("saveProviderError", error);
                        }
                    }}
                    columns={[
                        {
                            name: "name",
                            displayKey: "name",
                            cellRenderer: component => (
                                <Link
                                    key={component.name}
                                    data-testid="provider-name-link"
                                    to={toKeyProvider({
                                        realm,
                                        id: component.id!,
                                        providerType: component.providerId as ProviderType
                                    })}
                                >
                                    {component.name}
                                </Link>
                            )
                        },
                        {
                            name: "providerId",
                            displayKey: "provider"
                        },
                        {
                            name: "providerDescription",
                            displayKey: "providerDescription"
                        }
                    ]}
                    actions={[
                        {
                            title: t("delete"),
                            onClick: (_key, _idx, component) => {
                                setSelectedComponent(
                                    component as ComponentRepresentation
                                );
                                toggleDeleteDialog();
                            }
                        }
                    ]}
                />
            </section>
        </>
    );
};
