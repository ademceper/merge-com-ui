/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/UserRegistration.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { AlertVariant } from "../../shared/keycloak-ui-shared";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { useAlerts } from "../../shared/keycloak-ui-shared";
import { RoleMapping } from "../components/role-mapping/RoleMapping";
import { useRealm } from "../context/realm-context/RealmContext";
import { DefaultsGroupsTab } from "./DefaultGroupsTab";

export const UserRegistration = () => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(10);
    const { realmRepresentation: realm } = useRealm();
    const [key, setKey] = useState(0);

    const { addAlert, addError } = useAlerts();
    const { realm: realmName } = useRealm();

    const addComposites = async (composites: RoleRepresentation[]) => {
        const compositeArray = composites;

        try {
            await adminClient.roles.createComposite(
                { roleId: realm?.defaultRole!.id!, realm: realmName },
                compositeArray
            );
            setKey(key + 1);
            addAlert(t("addAssociatedRolesSuccess"), AlertVariant.success);
        } catch (error) {
            addError("addAssociatedRolesError", error);
        }
    };

    return (
        <div>
            <div className="flex border-b">
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 10 ? "border-b-2 border-primary" : ""}`}
                    onClick={() => setActiveTab(10)}
                    data-testid="default-roles-tab"
                >
                    {t("defaultRoles")}
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 20 ? "border-b-2 border-primary" : ""}`}
                    onClick={() => setActiveTab(20)}
                    data-testid="default-groups-tab"
                >
                    {t("defaultGroups")}
                </button>
            </div>
            {activeTab === 10 && (
                <RoleMapping
                    name={realm?.defaultRole!.name!}
                    id={realm?.defaultRole!.id!}
                    type="roles"
                    isManager
                    save={rows => addComposites(rows.map(r => r.role))}
                />
            )}
            {activeTab === 20 && <DefaultsGroupsTab />}
        </div>
    );
};
