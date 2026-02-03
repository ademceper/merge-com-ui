/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/user/UsersSection.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { useRealm } from "../context/realm-context/RealmContext";
import helpUrls from "../help-urls";
import { PermissionsTab } from "../components/permission-tab/PermissionTab";
import { UserDataTable } from "../components/users/UserDataTable";
import useIsFeatureEnabled, { Feature } from "../utils/useIsFeatureEnabled";
import { useAccess } from "../context/access/Access";

export default function UsersSection() {
    const { t } = useTranslation();
    const { realm: realmName } = useRealm();
    const { tab } = useParams<{ tab?: string }>();
    const { hasAccess } = useAccess();
    const isFeatureEnabled = useIsFeatureEnabled();

    const canViewPermissions =
        isFeatureEnabled(Feature.AdminFineGrainedAuthz) &&
        hasAccess("manage-authorization", "manage-users", "manage-clients");

    const content = () => {
        if (tab === "permissions" && canViewPermissions) {
            return <PermissionsTab type="users" />;
        }
        return <UserDataTable />;
    };

    return (
        <>
            <ViewHeader
                titleKey="titleUsers"
                subKey="usersExplain"
                helpUrl={helpUrls.usersUrl}
                divider={false}
            />
            <div data-testid="users-page" className="bg-muted/30 p-0">
                {content()}
            </div>
        </>
    );
}
