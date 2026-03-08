import { useTranslation } from "@merge-rd/i18n";
import { useAccess } from "../../app/providers/access/access";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import useIsFeatureEnabled, { Feature } from "../../shared/lib/useIsFeatureEnabled";
import { useParams } from "../../shared/lib/useParams";
import { PermissionsTab } from "../../shared/ui/permission-tab/permission-tab";
import { UsersListSection } from "./users-list-section";

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
        <div data-testid="users-page" className="pt-4 pb-6 px-0">
            {content()}
        </div>
    );
}
