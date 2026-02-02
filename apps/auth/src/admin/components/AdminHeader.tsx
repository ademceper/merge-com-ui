"use client";

/* eslint-disable */
// @ts-nocheck

import { useTranslation } from "react-i18next";
import type { KeycloakTokenParsed } from "oidc-spa/keycloak-js";
import type { TFunction } from "i18next";
import { Separator } from "@merge/ui/components/separator";
import { SidebarTrigger } from "@merge/ui/components/sidebar";
import { ThemeToggleButton } from "@merge/ui/components/theme-toggle";
import { useEnvironment } from "../../shared/keycloak-ui-shared";
import type { Environment } from "../environment";
import type { UserMenuInfo } from "../PageHeader";
import { AdminNavUser } from "./AdminNavUser";
import { PageBreadCrumbs } from "./bread-crumb/PageBreadCrumbs";
import { DotsThreeVertical } from "@phosphor-icons/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@merge/ui/components/dropdown-menu";

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

export function AdminHeader() {
    const { t } = useTranslation();
    const { keycloak } = useEnvironment<Environment>();
    const picture = keycloak.idTokenParsed?.picture;
    const userMenuInfo: UserMenuInfo = {
        keycloak,
        userName: loggedInUserName(keycloak.idTokenParsed, t),
        userEmail: userEmailFromToken(keycloak.idTokenParsed),
        userAvatarUrl: picture ?? undefined,
        initials: avatarInitials(keycloak.idTokenParsed)
    };

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mr-2 h-4 data-[orientation=vertical]:h-4"
                />
                <PageBreadCrumbs />
            </div>
            <div className="flex-1 min-w-0" />
            <div className="flex items-center gap-2 overflow-visible px-4">
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
        </header>
    );
}
