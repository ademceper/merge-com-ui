import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { SidebarTrigger } from "@merge/ui/components/sidebar";
import { GroupBreadCrumbsForHeader } from "./bread-crumb/GroupBreadCrumbs";
import { PageBreadCrumbs, usePageTitle } from "./bread-crumb/PageBreadCrumbs";
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
        <header className="flex h-12 shrink-0 items-center px-4 bg-sidebar">
            <SidebarTrigger className="md:hidden" />
            <div className="ml-1 mr-3 h-4 w-px shrink-0 bg-border md:hidden" />
            <span className="text-base font-semibold md:hidden">{pageTitle}</span>
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
            <AdminNavUser userMenuInfo={userMenuInfo} avatarOnly />
        </header>
    );
}
