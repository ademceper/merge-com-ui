/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/PageHeader.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useTranslation } from "react-i18next";
import { useHref } from "react-router-dom";
import type { Keycloak, KeycloakTokenParsed } from "oidc-spa/keycloak-js";
import { TFunction } from "i18next";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@merge/ui/components/dropdown-menu";
import { Button } from "@merge/ui/components/button";
import { ThemeToggleButton, useThemeToggle } from "@merge/ui/components/theme-toggle";
import { cn } from "@merge/ui/lib/utils";
import { PageContext } from "../shared/@patternfly/react-core";
import { useEnvironment } from "../shared/keycloak-ui-shared";
import { List, DotsThreeVertical } from "@phosphor-icons/react";
import { DefaultAvatar } from "../shared/keycloak-ui-shared/masthead/DefaultAvatar";
import { AdminNavUser } from "./components/AdminNavUser";
import { useContext, useEffect, useState } from "react";
import { useRealm } from "./context/realm-context/RealmContext";
import { toDashboard } from "./dashboard/routes/Dashboard";
import { usePreviewLogo } from "./realm-settings/themes/LogoContext";
import { joinPath } from "./utils/joinPath";

const baseUrl =
    typeof import.meta.env?.BASE_URL === "string" && import.meta.env.BASE_URL
        ? import.meta.env.BASE_URL.endsWith("/")
            ? import.meta.env.BASE_URL
            : import.meta.env.BASE_URL + "/"
        : "/";

function loggedInUserName(token: KeycloakTokenParsed | undefined, t: TFunction) {
    if (!token) return t("unknownUser");
    const givenName = token.given_name;
    const familyName = token.family_name;
    const preferredUsername = token.preferred_username;
    if (givenName && familyName) return t("fullName", { givenName, familyName });
    return givenName || familyName || preferredUsername || t("unknownUser");
}

function avatarInitials(token: KeycloakTokenParsed | undefined): string {
    if (!token) return "?";
    const given = token.given_name?.[0] ?? "";
    const family = token.family_name?.[0] ?? "";
    if (given || family) return `${given}${family}`.toUpperCase();
    const preferred = token.preferred_username?.[0];
    return preferred ? preferred.toUpperCase() : "?";
}

function userEmailFromToken(token: KeycloakTokenParsed | undefined): string {
    if (!token) return "";
    return (token as { email?: string }).email ?? token.preferred_username ?? "";
}

function SidebarToggleButton({ ariaLabel }: { ariaLabel: string }) {
    const { isManagedSidebar, onSidebarToggle, isSidebarOpen } = useContext(PageContext);
    const handleClick = isManagedSidebar ? onSidebarToggle : undefined;
    return (
        <Button
            variant="ghost"
            size="icon"
            aria-label={ariaLabel}
            aria-expanded={isManagedSidebar ? isSidebarOpen : undefined}
            className="shrink-0 md:flex"
            onClick={handleClick}
        >
            <List className="size-5" weight="bold" />
        </Button>
    );
}

export type UserMenuInfo = {
    keycloak: Keycloak;
    userName: string;
    userEmail: string;
    userAvatarUrl: string | undefined;
    initials: string;
};

/** Header for theme preview (no AdminClientContext / RealmContext). */
export const MinimalHeader = () => {
    const { environment, keycloak } = useEnvironment();
    const { t } = useTranslation();
    const { isDark } = useThemeToggle();
    const logoSrc = isDark ? `${baseUrl}merge-white-text.svg` : `${baseUrl}merge-black-text.svg`;
    const logoAlt = t("logo");
    const picture = keycloak.idTokenParsed?.picture;

    const userMenuInfo: UserMenuInfo = {
        keycloak,
        userName: loggedInUserName(keycloak.idTokenParsed, t),
        userEmail: userEmailFromToken(keycloak.idTokenParsed),
        userAvatarUrl: picture ?? undefined,
        initials: avatarInitials(keycloak.idTokenParsed)
    };

    return (
        <header
            data-testid="page-header"
            className={cn(
                "pf-v5-c-page__header !flex w-full flex-nowrap items-center justify-start gap-4 px-4 h-14 min-h-14",
                "bg-background text-foreground border-b border-border"
            )}
        >
            <SidebarToggleButton ariaLabel={t("navigation")} />
            <a
                href={environment.logoUrl || "#"}
                className="flex items-center shrink-0 min-h-9 h-9 min-w-[8rem] max-w-[11rem]"
                aria-label={logoAlt}
            >
                <img
                    src={logoSrc}
                    alt={logoAlt}
                    className="h-9 w-full max-w-[11rem] object-contain object-left"
                />
            </a>
            <div className="flex items-center gap-2 overflow-visible shrink-0">
                <div className="hidden md:block overflow-visible">
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger
                            data-testid="options-toggle"
                            className="rounded-full p-0 border-0 bg-transparent cursor-pointer inline-flex"
                        >
                            <DefaultAvatar size="lg" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="min-w-52 z-[9999]" align="end" sideOffset={4}>
                            <DropdownMenuLabel className="font-normal text-muted-foreground">
                                {loggedInUserName(keycloak.idTokenParsed, t)}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => keycloak.accountManagement()}>
                                {t("manageAccount")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => keycloak.logout()} variant="destructive">
                                {t("signOut")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="md:hidden overflow-visible">
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger
                            data-testid="options-kebab-toggle"
                            className="rounded p-1 border-0 bg-transparent cursor-pointer inline-flex text-foreground hover:bg-muted"
                        >
                            <DotsThreeVertical className="size-5" weight="bold" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="min-w-52 z-[9999]" align="end" sideOffset={4}>
                            <DropdownMenuLabel className="font-normal text-muted-foreground">
                                {loggedInUserName(keycloak.idTokenParsed, t)}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => keycloak.accountManagement()}>
                                {t("manageAccount")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => keycloak.logout()} variant="destructive">
                                {t("signOut")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="flex-1 min-w-0" />
        </header>
    );
};

export const Header = () => {
    const { environment, keycloak } = useEnvironment();
    const { t } = useTranslation();
    const { realm } = useRealm();
    const { isDark } = useThemeToggle();

    const contextLogo = usePreviewLogo();
    const customLogo = contextLogo?.logo?.trim();

    const url = useHref(toDashboard({ realm }));
    const logoHref = environment.logoUrl ? environment.logoUrl : url;
    const defaultLogoSrc = isDark ? `${baseUrl}merge-white-text.svg` : `${baseUrl}merge-black-text.svg`;
    const fallbackLogoSrc = isDark ? "/merge-white-text.svg" : "/merge-black-text.svg";
    const resolvedLogoSrc =
        customLogo && customLogo.length > 0
            ? customLogo.startsWith("/")
                ? joinPath(environment["resourceUrl"], customLogo)
                : customLogo
            : defaultLogoSrc;
    const [logoLoadFailed, setLogoLoadFailed] = useState(false);
    useEffect(() => {
        setLogoLoadFailed(false);
    }, [resolvedLogoSrc]);
    const logoSrcToUse = logoLoadFailed ? fallbackLogoSrc : resolvedLogoSrc;

    const picture = keycloak.idTokenParsed?.picture;
    const userMenuInfo: UserMenuInfo = {
        keycloak,
        userName: loggedInUserName(keycloak.idTokenParsed, t),
        userEmail: userEmailFromToken(keycloak.idTokenParsed),
        userAvatarUrl: picture ?? undefined,
        initials: avatarInitials(keycloak.idTokenParsed)
    };

    return (
        <header
            data-testid="page-header"
            className={cn(
                "pf-v5-c-page__header !flex w-full flex-nowrap items-center justify-start gap-4 px-4 h-14 min-h-14",
                "bg-background text-foreground border-b border-border"
            )}
        >
            <SidebarToggleButton ariaLabel={t("navigation")} />
            <a
                href={logoHref}
                className="flex items-center shrink-0 min-h-9 h-9 min-w-[8rem] max-w-[11rem]"
                aria-label={t("logo")}
            >
                <img
                    src={logoSrcToUse}
                    alt={t("logo")}
                    className="h-9 w-full max-w-[11rem] object-contain object-left block"
                    onError={() => setLogoLoadFailed(true)}
                />
            </a>
            <div className="flex items-center gap-2 overflow-visible shrink-0">
                <div className="hidden md:flex items-center gap-2 overflow-visible">
                    <AdminNavUser userMenuInfo={userMenuInfo} />
                    <ThemeToggleButton />
                </div>
                <div className="md:hidden overflow-visible">
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger
                            data-testid="options-kebab-toggle"
                            className="rounded p-1 border-0 bg-transparent cursor-pointer inline-flex text-foreground hover:bg-muted"
                        >
                            <DotsThreeVertical className="size-5" weight="bold" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="min-w-52 z-[9999]" align="end" sideOffset={4}>
                            <DropdownMenuLabel className="font-normal text-muted-foreground">
                                {loggedInUserName(keycloak.idTokenParsed, t)}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => keycloak.accountManagement()}>
                                {t("manageAccount")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => keycloak.logout()} variant="destructive">
                                {t("signOut")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="flex-1 min-w-0" />
        </header>
    );
};
