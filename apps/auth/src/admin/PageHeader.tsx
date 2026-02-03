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
import { useHref, useNavigate } from "react-router-dom";
import {
    CaretDownIcon,
    QuestionIcon,
    SignOutIcon,
    UserIcon,
    GlobeIcon,
    TrashIcon
} from "@phosphor-icons/react";
import { Button } from "@merge/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@merge/ui/components/dropdown-menu";
import { Separator } from "@merge/ui/components/separator";
import { useEnvironment, useHelp } from "../shared/keycloak-ui-shared";
import { PageHeaderClearCachesModal } from "./PageHeaderClearCachesModal";
import { HelpHeader } from "./components/help-enabler/HelpHeader";
import { useAccess } from "./context/access/Access";
import { useRealm } from "./context/realm-context/RealmContext";
import { toDashboard } from "./dashboard/routes/Dashboard";
import { usePreviewLogo } from "./realm-settings/themes/LogoContext";
import { joinPath } from "./utils/joinPath";
import useToggle from "./utils/useToggle";
import type { Environment } from "./environment";

const baseUrl = import.meta.env.BASE_URL;

export const Header = () => {
    const { t } = useTranslation();
    const { environment, keycloak } = useEnvironment<Environment>();
    const { realm } = useRealm();
    const { hasAccess } = useAccess();
    const { enabled, toggleHelp } = useHelp();
    const [clearCachesOpen, toggleClearCaches] = useToggle();
    const navigate = useNavigate();
    const dashboardHref = useHref(toDashboard({ realm }));

    const contextLogo = usePreviewLogo();
    const customLogo = contextLogo?.logo;
    const isMasterRealm = realm === "master";
    const isManager = hasAccess("manage-realm");

    const logoSrc = customLogo
        ? customLogo.startsWith("/")
            ? joinPath(environment["resourceUrl"], customLogo)
            : customLogo
        : `${baseUrl}merge-black-text.svg`;

    return (
        <header
            data-testid="page-header"
            className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
        >
            <div className="container mx-auto max-w-7xl p-4 md:p-10">
                <div className="w-full lg:max-w-232 mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] lg:gap-x-12 items-center mb-6 gap-y-4">
                        <div className="flex items-center justify-center lg:justify-start">
                            <a
                                href={dashboardHref}
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate(dashboardHref);
                                }}
                            >
                                <img
                                    src={logoSrc}
                                    alt={t("logo")}
                                    className="h-11 w-auto max-w-52 object-contain"
                                />
                            </a>
                        </div>
                        <div className="flex flex-row items-center justify-between gap-4">
                            <div className="space-y-0.5 min-w-0">
                                <h2 className="text-2xl font-bold tracking-tight">
                                    Identity Yönetim Konsolu
                                </h2>
                                <p className="text-muted-foreground">
                                    Realm ve kullanıcı yönetimi
                                </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <HelpHeader />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="gap-2">
                                            <UserIcon className="size-4" />
                                            <span className="hidden sm:inline">
                                                {t("manageAccount")}
                                            </span>
                                            <CaretDownIcon className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuItem
                                            id="manage-account"
                                            onClick={() => keycloak.accountManagement()}
                                        >
                                            <UserIcon className="size-4 mr-2" />
                                            {t("manageAccount")}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <a
                                                href={dashboardHref}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    navigate(dashboardHref);
                                                }}
                                                className="flex items-center"
                                            >
                                                <GlobeIcon className="size-4 mr-2" />
                                                {t("realmInfo")}
                                            </a>
                                        </DropdownMenuItem>
                                        {isMasterRealm && isManager && (
                                            <DropdownMenuItem
                                                onClick={() => toggleClearCaches()}
                                            >
                                                <TrashIcon className="size-4 mr-2" />
                                                {t("clearCachesTitle")}
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => toggleHelp()}>
                                            <QuestionIcon className="size-4 mr-2" />
                                            {enabled
                                                ? t("helpEnabled")
                                                : t("helpDisabled")}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => keycloak.logout()}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <SignOutIcon className="size-4 mr-2" />
                                            {t("signOut")}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Separator className="mb-0" />
            {clearCachesOpen && (
                <PageHeaderClearCachesModal onClose={() => toggleClearCaches()} />
            )}
        </header>
    );
};
