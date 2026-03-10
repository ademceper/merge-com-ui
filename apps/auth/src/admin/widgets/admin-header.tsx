import { useTranslation } from "@merge-rd/i18n";
import { SidebarPageHeader } from "@merge-rd/ui/components/sidebar";
import { useLocation } from "@tanstack/react-router";
import { useMemo } from "react";
import { useEnvironment } from "@/shared/keycloak-ui-shared";
import type { Environment } from "../app/environment";
import {
    avatarInitials,
    loggedInUserName,
    userEmailFromToken
} from "../shared/lib/user-menu-utils";
import { GroupBreadCrumbsForHeader } from "../shared/ui/bread-crumb/group-bread-crumbs";
import {
    PageBreadCrumbs,
    usePageTitle
} from "../shared/ui/bread-crumb/page-bread-crumbs";
import { AdminNavUser } from "./admin-nav-user";

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
    const { pathname } = useLocation();
    const { keycloak } = useEnvironment<Environment>();
    const isGroupsSection = pathname.includes("/groups");
    const pageTitle = usePageTitle();

    const userMenuInfo = useMemo<UserMenuInfo>(
        () => ({
            keycloak,
            userName: loggedInUserName(keycloak.idTokenParsed, t),
            userEmail: userEmailFromToken(keycloak.idTokenParsed),
            userAvatarUrl: keycloak.idTokenParsed?.picture ?? undefined,
            initials: avatarInitials(keycloak.idTokenParsed)
        }),
        [keycloak, t]
    );

    return (
        <SidebarPageHeader>
            <span className="text-base md:hidden">{pageTitle}</span>
            <span className="hidden md:contents">
                {isGroupsSection ? <GroupBreadCrumbsForHeader /> : <PageBreadCrumbs />}
            </span>
            <div className="flex-1 min-w-0" />
            <AdminNavUser userMenuInfo={userMenuInfo} />
        </SidebarPageHeader>
    );
}
