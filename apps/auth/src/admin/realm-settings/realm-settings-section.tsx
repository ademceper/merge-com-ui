import { useContext } from "react";
import { KeycloakSpinner } from "../../shared/keycloak-ui-shared";
import { AdminClientContext } from "../admin-client";
import { RealmSettingsTabs } from "./RealmSettingsTabs";

export default function RealmSettingsSection() {
    const adminClientValue = useContext(AdminClientContext);
    if (!adminClientValue) {
        return <KeycloakSpinner />;
    }
    return <RealmSettingsTabs />;
}
