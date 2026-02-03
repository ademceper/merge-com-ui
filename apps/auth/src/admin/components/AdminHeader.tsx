import { useTranslation } from "react-i18next";
import { SidebarTrigger } from "@merge/ui/components/sidebar";
import { PageBreadCrumbs } from "./bread-crumb/PageBreadCrumbs";
import { Separator } from "@merge/ui/components/separator";
import { useEnvironment } from "../../shared/keycloak-ui-shared";
import type { Environment } from "../environment";
import { AdminNavUser } from "./AdminNavUser";
import { loggedInUserName, avatarInitials, userEmailFromToken } from "../utils/userMenuUtils";

export type UserMenuInfo = {
    keycloak: {
        idTokenParsed?: unknown;
        logout: (options?: { redirectUri?: string }) => Promise<void>;
        accountManagement: () => void;
    };
    userName: string;
    userEmail: string;
    userAvatarUrl?: string;
    initials: string;
};

export function AdminHeader() {
    const { t } = useTranslation();
    const { keycloak } = useEnvironment<Environment>();

    const userMenuInfo: UserMenuInfo = {
        keycloak,
        userName: loggedInUserName(keycloak.idTokenParsed, t),
        userEmail: userEmailFromToken(keycloak.idTokenParsed),
        userAvatarUrl: keycloak.idTokenParsed?.picture ?? undefined,
        initials: avatarInitials(keycloak.idTokenParsed)
    };

    return (
        <header className="relative z-50 flex h-16 shrink-0 items-center gap-2 bg-background">
            <div className="flex items-center gap-2 px-4">
                <div className="flex h-4 items-center gap-2">
                    <SidebarTrigger />
                    <Separator
                        orientation="vertical"
                        className="h-4 w-px shrink-0"
                    />
                </div>
                <PageBreadCrumbs />
            </div>
            <div className="flex-1 min-w-0" />
            <div className="flex items-center px-4">
                <AdminNavUser userMenuInfo={userMenuInfo} avatarOnly />
            </div>
        </header>
    );
}
