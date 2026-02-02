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

import { ViewHeader } from "../components/view-header/ViewHeader";
import { useRealm } from "../context/realm-context/RealmContext";
import helpUrls from "../help-urls";
import { PermissionsTab } from "../components/permission-tab/PermissionTab";
import { UserDataTable } from "../components/users/UserDataTable";
import { toUsers, UserTab } from "./routes/Users";
import { RoutableTabs, Tab, useRoutableTab } from "../components/routable-tabs/RoutableTabs";
import useIsFeatureEnabled, { Feature } from "../utils/useIsFeatureEnabled";
import { useAccess } from "../context/access/Access";

export default function UsersSection() {
    const { t } = useTranslation();
    const { realm: realmName } = useRealm();
    const { hasAccess } = useAccess();
    const isFeatureEnabled = useIsFeatureEnabled();

    const canViewPermissions =
        isFeatureEnabled(Feature.AdminFineGrainedAuthz) &&
        hasAccess("manage-authorization", "manage-users", "manage-clients");

    const useTab = (tab: UserTab) =>
        useRoutableTab(
            toUsers({
                realm: realmName,
                tab
            })
        );

    const listTab = useTab("list");
    const permissionsTab = useTab("permissions");

    return (
        <>
            <ViewHeader
                titleKey="titleUsers"
                subKey="usersExplain"
                helpUrl={helpUrls.usersUrl}
                divider={false}
            />
            <div data-testid="users-page" className="bg-muted/30 p-0">
                <RoutableTabs
                    data-testid="user-tabs"
                    defaultLocation={toUsers({
                        realm: realmName,
                        tab: "list"
                    })}
                    isBox
                    mountOnEnter
                >
                    <Tab
                        eventKey={listTab.eventKey}
                        id="list"
                        data-testid="listTab"
                        title={t("userList")}
                        {...listTab}
                    >
                        <UserDataTable />
                    </Tab>
                    {canViewPermissions && (
                        <Tab
                            eventKey={permissionsTab.eventKey}
                            id="permissions"
                            data-testid="permissionsTab"
                            title={t("permissions")}
                            {...permissionsTab}
                        >
                            <PermissionsTab type="users" />
                        </Tab>
                    )}
                </RoutableTabs>
            </div>
        </>
    );
}
