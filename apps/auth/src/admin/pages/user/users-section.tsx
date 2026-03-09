import { useTranslation } from "@merge-rd/i18n";
import { useAccess } from "@/admin/app/providers/access/access";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { useIsFeatureEnabled, Feature } from "@/admin/shared/lib/use-is-feature-enabled";
import { useParams } from "@/admin/shared/lib/use-params";
import { PermissionsTab } from "@/admin/shared/ui/permission-tab/permission-tab";
import { UsersListSection } from "./users-list-section";

export function UsersSection() {
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
