import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { PermissionsTab } from "../../shared/ui/permission-tab/permission-tab";
import useIsFeatureEnabled, { Feature } from "../../shared/lib/useIsFeatureEnabled";
import { UsersListSection } from "./users-list-section";
import { useAccess } from "../../app/providers/access/access";

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
                        <div data-testid="users-page" className="pt-4 pb-6 px-0">
                {content()}
            </div>
        </>
    );
}
