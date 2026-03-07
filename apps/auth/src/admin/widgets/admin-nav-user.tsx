"use client";

import { useTranslation } from "@merge-rd/i18n";
import { useTheme } from "next-themes";
import { SignOutIcon, UserIcon, PaletteIcon, SunIcon, MoonIcon, MonitorIcon } from "@phosphor-icons/react";
import { Avatar, AvatarFallback } from "@merge-rd/ui/components/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
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
} from "@merge-rd/ui/components/dropdown-menu";
import type { UserMenuInfo } from "./admin-header";

export function AdminNavUser({ userMenuInfo }: { userMenuInfo: UserMenuInfo }) {
    const { t } = useTranslation();
    const { theme, setTheme } = useTheme();
    const { keycloak, userName, userEmail, initials } = userMenuInfo;

    const onThemeChange = (value: string) => {
        if (typeof window !== "undefined" && document.startViewTransition) {
            document.startViewTransition(() => setTheme(value));
        } else {
            setTheme(value);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button type="button" className="cursor-pointer outline-none">
                    <Avatar size="sm">
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-neutral-500">{userEmail}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => keycloak.accountManagement()}>
                    <UserIcon className="mr-2 size-4" />
                    {t("manageAccount")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <PaletteIcon className="mr-2 size-4" />
                        {t("theme", "Theme")}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            <DropdownMenuLabel>{t("appearance", "Appearance")}</DropdownMenuLabel>
                            <DropdownMenuRadioGroup value={theme ?? "system"} onValueChange={onThemeChange}>
                                <DropdownMenuRadioItem value="light">
                                    <SunIcon className="mr-2 size-4" />
                                    {t("light", "Light")}
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="dark">
                                    <MoonIcon className="mr-2 size-4" />
                                    {t("dark", "Dark")}
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="system">
                                    <MonitorIcon className="mr-2 size-4" />
                                    {t("system", "System")}
                                </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => keycloak.logout()}>
                    <SignOutIcon className="mr-2 size-4" />
                    {t("signOut")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
