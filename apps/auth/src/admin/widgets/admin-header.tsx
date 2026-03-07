import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { SidebarPageHeader } from "@merge-rd/ui/components/sidebar";
import { GroupBreadCrumbsForHeader } from "../shared/ui/bread-crumb/group-bread-crumbs";
import { PageBreadCrumbs, usePageTitle } from "../shared/ui/bread-crumb/page-bread-crumbs";
import { useEnvironment } from "../../shared/keycloak-ui-shared";
import type { Environment } from "../app/environment";
import { AdminNavUser } from "./admin-nav-user";
import { loggedInUserName, avatarInitials, userEmailFromToken } from "../shared/lib/userMenuUtils";

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

    const userMenuInfo: UserMenuInfo = {
        keycloak,
        userName: loggedInUserName(keycloak.idTokenParsed, t),
        userEmail: userEmailFromToken(keycloak.idTokenParsed),
        userAvatarUrl: keycloak.idTokenParsed?.picture ?? undefined,
        initials: avatarInitials(keycloak.idTokenParsed)
    };

    return (
        <SidebarPageHeader>
            <span className="text-base md:hidden">{pageTitle}</span>
            <span className="hidden md:contents">
                {isGroupsSection ? <GroupBreadCrumbsForHeader /> : <PageBreadCrumbs />}
            </span>
            <div className="flex-1 min-w-0" />
            <button
                type="button"
                className="inline-flex h-7 items-center rounded-md bg-neutral-100 px-2.5 text-xs font-medium text-neutral-600 hover:bg-neutral-200 transition-colors mr-2"
                onClick={() => {
                    const wrapper = document.querySelector("[data-scale-wrapper]");
                    if (wrapper) {
                        const isScaled = wrapper.getAttribute("data-scaled") === "true";
                        wrapper.setAttribute("data-scaled", isScaled ? "false" : "true");
                    }
                }}
            >
                Scale
            </button>
            <AdminNavUser userMenuInfo={userMenuInfo} />
        </SidebarPageHeader>
    );
}
