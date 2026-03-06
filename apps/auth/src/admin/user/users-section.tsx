import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { ViewHeader } from "../components/view-header/view-header";
import { useRealm } from "../context/realm-context/realm-context";
import helpUrls from "../help-urls";
import { PermissionsTab } from "../components/permission-tab/permission-tab";
import useIsFeatureEnabled, { Feature } from "../utils/useIsFeatureEnabled";
import { UsersListSection } from "./users-list-section";
import { useAccess } from "../context/access/access";

export default function UsersSection() {
    useTranslation();
    useRealm();
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
        return <UsersListSection />;
    };

    return (
        <>
            <ViewHeader
                titleKey="titleUsers"
                subKey="usersExplain"
                helpUrl={helpUrls.usersUrl}
                divider
            />
            <div data-testid="users-page" className="pt-4 pb-6 px-0">
                {content()}
            </div>
        </>
    );
}
