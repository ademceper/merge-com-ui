/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/user-profile/AttributesGroupTab.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type { UserProfileGroup } from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import { Button } from "@merge/ui/components/button";
import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { ListEmptyState } from "../../../shared/keycloak-ui-shared";
import { Action, KeycloakDataTable } from "../../../shared/keycloak-ui-shared";
import { useRealm } from "../../context/realm-context/RealmContext";
import { toEditAttributesGroup } from "../routes/EditAttributesGroup";
import { toNewAttributesGroup } from "../routes/NewAttributesGroup";
import { useUserProfile } from "./UserProfileContext";
import useLocale from "../../utils/useLocale";
import { useAdminClient } from "../../admin-client";

type AttributesGroupTabProps = {
    setTableData: React.Dispatch<
        React.SetStateAction<Record<string, string>[] | undefined>
    >;
};

export const AttributesGroupTab = ({ setTableData }: AttributesGroupTabProps) => {
    const { adminClient } = useAdminClient();
    const { config, save } = useUserProfile();
    const { t } = useTranslation();
    const combinedLocales = useLocale();
    const navigate = useNavigate();
    const { realm } = useRealm();
    const [key, setKey] = useState(0);
    const [groupToDelete, setGroupToDelete] = useState<UserProfileGroup>();

    // Refresh data in table when config changes.
    useEffect(() => setKey(value => value + 1), [config]);

    async function loader() {
        return config?.groups ?? [];
    }

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "deleteDialogTitle",
        children: (
            <Trans i18nKey="deleteDialogDescription">
                {" "}
                <strong>{{ group: groupToDelete?.name }}</strong>.
            </Trans>
        ),
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            const groups = (config?.groups ?? []).filter(
                group => group !== groupToDelete
            );
            const translationsForDisplayHeaderToDelete =
                groupToDelete?.displayHeader?.substring(
                    2,
                    groupToDelete?.displayHeader.length - 1
                );
            const translationsForDisplayDescriptionToDelete =
                groupToDelete?.displayDescription?.substring(
                    2,
                    groupToDelete?.displayDescription.length - 1
                );

            try {
                await Promise.all(
                    combinedLocales.map(async locale => {
                        try {
                            const response =
                                await adminClient.realms.getRealmLocalizationTexts({
                                    realm,
                                    selectedLocale: locale
                                });

                            if (response) {
                                await adminClient.realms.deleteRealmLocalizationTexts({
                                    realm,
                                    selectedLocale: locale,
                                    key: translationsForDisplayHeaderToDelete
                                });

                                await adminClient.realms.deleteRealmLocalizationTexts({
                                    realm,
                                    selectedLocale: locale,
                                    key: translationsForDisplayDescriptionToDelete
                                });

                                const updatedData =
                                    await adminClient.realms.getRealmLocalizationTexts({
                                        realm,
                                        selectedLocale: locale
                                    });
                                setTableData([updatedData]);
                            }
                        } catch {
                            console.error(`Error removing translations for ${locale}`);
                        }
                    })
                );

                await save(
                    { ...config, groups },
                    {
                        successMessageKey: "deleteSuccess",
                        errorMessageKey: "deleteAttributeGroupError"
                    }
                );
            } catch (error) {
                console.error(
                    `Error removing translations or updating attributes group: ${error}`
                );
            }
        }
    });

    function deleteAttributeGroup(group: UserProfileGroup) {
        setGroupToDelete(group);
        toggleDeleteDialog();
    }

    return (
        <div className="p-0">
            <DeleteConfirm />
            <KeycloakDataTable
                key={key}
                loader={loader}
                ariaLabelKey="tableTitle"
                toolbarItem={
                    <div>
                        <Button
                            data-testid="create-attributes-groups-action"
                            asChild
                        >
                            <Link to={toNewAttributesGroup({ realm })}>
                                {t("createGroupText")}
                            </Link>
                        </Button>
                    </div>
                }
                columns={[
                    {
                        name: "name",
                        displayKey: "columnName",
                        cellRenderer: group => (
                            <Link
                                to={toEditAttributesGroup({
                                    realm,
                                    name: group.name!
                                })}
                            >
                                {group.name}
                            </Link>
                        )
                    },
                    {
                        name: "displayHeader",
                        displayKey: "columnDisplayName"
                    },
                    {
                        name: "displayDescription",
                        displayKey: "columnDisplayDescription"
                    }
                ]}
                actions={[
                    {
                        title: t("delete"),
                        onRowClick: deleteAttributeGroup
                    } as Action<UserProfileGroup>
                ]}
                emptyState={
                    <ListEmptyState
                        message={t("emptyStateMessage")}
                        instructions={t("emptyStateInstructions")}
                        primaryActionText={t("createGroupText")}
                        onPrimaryAction={() => navigate(toNewAttributesGroup({ realm }))}
                    />
                }
            />
        </div>
    );
};
