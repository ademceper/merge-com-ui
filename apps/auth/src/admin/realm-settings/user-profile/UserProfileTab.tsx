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

import { AttributesGroupTab } from "./AttributesGroupTab";
import { AttributesTab } from "./AttributesTab";
import { JsonEditorTab } from "./JsonEditorTab";
import { UserProfileProvider } from "./UserProfileContext";

type UserProfileTabProps = {
    setTableData: React.Dispatch<
        React.SetStateAction<Record<string, string>[] | undefined>
    >;
    subTab?: string;
};

export const UserProfileTab = ({ setTableData, subTab = "attributes" }: UserProfileTabProps) => {
    const renderContent = () => {
        switch (subTab) {
            case "attributes-group":
                return <AttributesGroupTab setTableData={setTableData} />;
            case "json-editor":
                return <JsonEditorTab />;
            default:
                return <AttributesTab setTableData={setTableData} />;
        }
    };

    return (
        <UserProfileProvider>
            {renderContent()}
        </UserProfileProvider>
    );
};
