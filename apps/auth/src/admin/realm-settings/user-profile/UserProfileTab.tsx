/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/user-profile/UserProfileTab.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Tab } from "../../components/routable-tabs/RoutableTabs";
import { useTranslation } from "react-i18next";
import { RoutableTabs, useRoutableTab } from "../../components/routable-tabs/RoutableTabs";
import { useRealm } from "../../context/realm-context/RealmContext";
import { toUserProfile, UserProfileTab as IUserProfileTab } from "../routes/UserProfile";
import { AttributesGroupTab } from "./AttributesGroupTab";
import { AttributesTab } from "./AttributesTab";
import { JsonEditorTab } from "./JsonEditorTab";
import { UserProfileProvider } from "./UserProfileContext";

type UserProfileTabProps = {
    setTableData: React.Dispatch<
        React.SetStateAction<Record<string, string>[] | undefined>
    >;
};

export const UserProfileTab = ({ setTableData }: UserProfileTabProps) => {
    const { realm } = useRealm();
    const { t } = useTranslation();

    const useTab = (tab: IUserProfileTab) =>
        useRoutableTab(toUserProfile({ realm, tab }));

    const attributesTab = useTab("attributes");
    const attributesGroupTab = useTab("attributes-group");
    const jsonEditorTab = useTab("json-editor");

    return (
        <UserProfileProvider>
            <RoutableTabs
                defaultLocation={toUserProfile({ realm, tab: "attributes" })}
                mountOnEnter
            >
                <Tab
                    title={t("attributes")}
                    data-testid="attributesTab"
                    eventKey={attributesTab.eventKey}
                >
                    <AttributesTab setTableData={setTableData} />
                </Tab>
                <Tab
                    title={t("attributesGroup")}
                    data-testid="attributesGroupTab"
                    eventKey={attributesGroupTab.eventKey}
                >
                    <AttributesGroupTab setTableData={setTableData} />
                </Tab>
                <Tab
                    title={t("jsonEditor")}
                    data-testid="jsonEditorTab"
                    eventKey={jsonEditorTab.eventKey}
                >
                    <JsonEditorTab />
                </Tab>
            </RoutableTabs>
        </UserProfileProvider>
    );
};
