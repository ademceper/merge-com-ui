import { useContext } from "react";
import { KeycloakSpinner } from "@/shared/keycloak-ui-shared";
import { AdminClientContext } from "@/admin/app/admin-client";
import { RealmSettingsTabs } from "./realm-settings-tabs";

export default function RealmSettingsSection() {
    const adminClientValue = useContext(AdminClientContext);
    if (!adminClientValue) {
        return <KeycloakSpinner />;
    }
    return <RealmSettingsTabs />;
}
