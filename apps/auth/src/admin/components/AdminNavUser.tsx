"use client";

import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { CaretDownIcon, QuestionIcon, SignOutIcon, UserIcon, GearIcon, TrashIcon, PaletteIcon, SunIcon, MoonIcon, MonitorIcon } from "@phosphor-icons/react";
import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from "@merge/ui/components/avatar";
import { cn } from "@merge/ui/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "@merge/ui/components/dropdown-menu";
import type { UserMenuInfo } from "./AdminHeader";
import { useHelp } from "../../shared/keycloak-ui-shared";
import { useRealm } from "../context/realm-context/RealmContext";
import { useAccess } from "../context/access/Access";
import { toDashboard } from "../dashboard/routes/Dashboard";
import useToggle from "../utils/useToggle";
import { PageHeaderClearCachesModal } from "../PageHeaderClearCachesModal";

export function AdminNavUser({
    userMenuInfo,
    avatarOnly = false
}: {
    userMenuInfo: UserMenuInfo;
    avatarOnly?: boolean;
}) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const { keycloak, userName, userEmail, userAvatarUrl, initials } = userMenuInfo;
    const { realm } = useRealm();
    const { hasAccess } = useAccess();
    const { enabled, toggleHelp } = useHelp();
    const [clearCachesOpen, toggleClearCaches] = useToggle();

    const onThemeChange = (value: string) => {
        if (typeof window !== "undefined" && document.startViewTransition) {
            document.startViewTransition(() => setTheme(value));
        } else {
            setTheme(value);
        }
    };

    const isMasterRealm = realm === "master";
    const isManager = hasAccess("manage-realm");

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    className={cn(
                        "inline-flex items-center justify-center rounded-lg border-0 outline-none cursor-pointer",
                        "text-foreground font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        !avatarOnly && "bg-transparent hover:bg-muted/50 data-[state=open]:bg-muted/70",
                        avatarOnly && "size-9 p-0 bg-transparent hover:bg-transparent data-[state=open]:bg-transparent",
                        !avatarOnly && "h-auto w-full min-w-0 gap-2 py-2 pr-2 pl-2"
                    )}
                >
                    <Avatar
                        className={cn(
                            "shrink-0 bg-muted text-muted-foreground",
                            avatarOnly && "after:border-0",
                            avatarOnly ? "size-8 rounded-lg" : "h-8 w-8 rounded-lg"
                        )}
                    >
                        <AvatarImage src={userAvatarUrl} alt={userName} />
                        <AvatarFallback className="rounded-lg text-xs font-medium">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    {!avatarOnly && (
                        <>
                            <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                                <span className="truncate font-medium text-foreground">{userName}</span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {userEmail || " "}
                                </span>
                            </div>
                            <CaretDownIcon className="ml-auto size-4 shrink-0 text-muted-foreground" />
                        </>
                    )}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="min-w-56 rounded-lg z-[99999] bg-background border border-border text-foreground shadow-lg"
                    side="bottom"
                    align="end"
                    sideOffset={4}
                >
                    <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-2 py-2 text-left text-sm bg-background">
                            <Avatar className="h-8 w-8 rounded-lg shrink-0 bg-muted text-muted-foreground after:border-0">
                                <AvatarImage src={userAvatarUrl} alt={userName} />
                                <AvatarFallback className="rounded-lg text-xs font-medium">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                                <span className="truncate font-medium text-foreground">{userName}</span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {userEmail || " "}
                                </span>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            id="manage-account"
                            onClick={() => keycloak.accountManagement()}
                        >
                            <UserIcon className="size-4 mr-2" />
                            {t("manageAccount")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => navigate(toDashboard({ realm }).pathname ?? `/${encodeURIComponent(realm)}`)}
                        >
                            <GearIcon className="size-4 mr-2" />
                            {t("realmInfo")}
                        </DropdownMenuItem>
                        {isMasterRealm && isManager && (
                            <DropdownMenuItem onClick={() => toggleClearCaches()}>
                                <TrashIcon className="size-4 mr-2" />
                                {t("clearCachesTitle")}
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <PaletteIcon className="size-4 mr-2" />
                                {t("theme", "Theme")}
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuGroup>
                                        <DropdownMenuLabel>{t("appearance", "Appearance")}</DropdownMenuLabel>
                                        <DropdownMenuRadioGroup
                                            value={theme ?? "system"}
                                            onValueChange={onThemeChange}
                                        >
                                            <DropdownMenuRadioItem value="light">
                                                <SunIcon className="size-4 mr-2" />
                                                {t("light", "Light")}
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="dark">
                                                <MoonIcon className="size-4 mr-2" />
                                                {t("dark", "Dark")}
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="system">
                                                <MonitorIcon className="size-4 mr-2" />
                                                {t("system", "System")}
                                            </DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuGroup>
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => toggleHelp()}>
                        <QuestionIcon className="size-4 mr-2" />
                        {enabled ? t("helpEnabled") : t("helpDisabled")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => keycloak.logout()}
                        variant="destructive"
                    >
                        <SignOutIcon className="size-4 mr-2" />
                        {t("signOut")}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            {clearCachesOpen && (
                <PageHeaderClearCachesModal onClose={() => toggleClearCaches()} />
            )}
        </>
    );
}
