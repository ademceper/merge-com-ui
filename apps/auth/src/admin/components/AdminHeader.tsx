import { useTranslation } from "react-i18next";
import { Link, useHref } from "react-router-dom";
import { ChevronDown, HelpCircle, LogOut, User, Server, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useEnvironment, useHelp } from "../../shared/keycloak-ui-shared";
import { toDashboard } from "../dashboard/routes/Dashboard";
import { useRealm } from "../context/realm-context/RealmContext";
import { useAccess } from "../context/access/Access";
import useToggle from "../utils/useToggle";
import { PageHeaderClearCachesModal } from "../PageHeaderClearCachesModal";
import { HelpHeader } from "./help-enabler/HelpHeader";
import { AdminBreadcrumbs } from "./AdminBreadcrumbs";
import { joinPath } from "../utils/joinPath";
import { usePreviewLogo } from "../realm-settings/themes/LogoContext";
import type { Environment } from "../environment";
import logoSvgUrl from "../assets/logo.svg";

export function AdminHeader() {
    const { t } = useTranslation();
    const { environment, keycloak } = useEnvironment<Environment>();
    const { realm } = useRealm();
    const { hasAccess } = useAccess();
    const { enabled, toggleHelp } = useHelp();
    const [clearCachesOpen, toggleClearCaches] = useToggle();
    const contextLogo = usePreviewLogo();
    const customLogo = contextLogo?.logo;
    const isMasterRealm = realm === "master";
    const isManager = hasAccess("manage-realm");
    const url = useHref(toDashboard({ realm }));
    const logoSrc = customLogo
        ? customLogo.startsWith("/")
            ? joinPath(environment["resourceUrl"], customLogo)
            : customLogo
        : logoSvgUrl;

    return (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center gap-4 px-4 md:px-6">
                <Link to={url} className="flex items-center gap-2 shrink-0">
                    <img
                        src={logoSrc}
                        alt={t("brandName")}
                        className="h-8 w-auto object-contain"
                    />
                    <span className="font-semibold hidden sm:inline-block">
                        {t("brandName")}
                    </span>
                </Link>
                <div className="flex-1 min-w-0 flex items-center gap-4">
                    <AdminBreadcrumbs />
                </div>
                <div className="flex items-center gap-2">
                    <HelpHeader />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <User className="size-4" />
                                <span className="hidden sm:inline">{t("manageAccount")}</span>
                                <ChevronDown className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem
                                id="manage-account"
                                onClick={() => keycloak.accountManagement()}
                            >
                                <User className="size-4 mr-2" />
                                {t("manageAccount")}
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to={toDashboard({ realm })}>
                                    <Server className="size-4 mr-2" />
                                    {t("realmInfo")}
                                </Link>
                            </DropdownMenuItem>
                            {isMasterRealm && isManager && (
                                <DropdownMenuItem onClick={() => toggleClearCaches()}>
                                    <Trash2 className="size-4 mr-2" />
                                    {t("clearCachesTitle")}
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => toggleHelp()}>
                                <HelpCircle className="size-4 mr-2" />
                                {enabled ? t("helpEnabled") : t("helpDisabled")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => keycloak.logout()}
                                className="text-destructive focus:text-destructive"
                            >
                                <LogOut className="size-4 mr-2" />
                                {t("signOut")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            {clearCachesOpen && (
                <PageHeaderClearCachesModal onClose={() => toggleClearCaches()} />
            )}
        </header>
    );
}
