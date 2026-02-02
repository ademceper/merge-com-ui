"use client";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CaretDownIcon, QuestionIcon, SignOutIcon, UserIcon, GearIcon, TrashIcon } from "@phosphor-icons/react";
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
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@merge/ui/components/dropdown-menu";
import type { UserMenuInfo } from "../PageHeader";
import { useHelp } from "../../shared/keycloak-ui-shared";
import { useRealm } from "../context/realm-context/RealmContext";
import { useAccess } from "../context/access/Access";
import { toDashboard } from "../dashboard/routes/Dashboard";
import useToggle from "../utils/useToggle";
import { PageHeaderClearCachesModal } from "../PageHeaderClearCachesModal";

export function AdminNavUser({ userMenuInfo }: { userMenuInfo: UserMenuInfo }) {
    const { t } = useTranslation();
    const { keycloak, userName, userEmail, userAvatarUrl, initials } = userMenuInfo;
    const { realm } = useRealm();
    const { hasAccess } = useAccess();
    const { enabled, toggleHelp } = useHelp();
    const [clearCachesOpen, toggleClearCaches] = useToggle();

    const isMasterRealm = realm === "master";
    const isManager = hasAccess("manage-realm");

    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger
                    className={cn(
                        "h-auto gap-2 py-2 pr-2 pl-2 inline-flex w-full min-w-0 rounded-lg",
                        "bg-transparent hover:bg-muted/50 text-foreground font-medium",
                        "data-[state=open]:bg-muted/70 data-[state=open]:text-foreground",
                        "border-0 outline-none cursor-pointer"
                    )}
                >
                    <Avatar className="h-8 w-8 rounded-lg shrink-0 bg-muted text-muted-foreground">
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
                    <CaretDownIcon className="ml-auto size-4 shrink-0 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="min-w-56 rounded-lg z-[9999] bg-background border border-border text-foreground shadow-lg"
                    side="bottom"
                    align="end"
                    sideOffset={4}
                >
                    <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-2 py-2 text-left text-sm bg-background">
                            <Avatar className="h-8 w-8 rounded-lg shrink-0 bg-muted text-muted-foreground">
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
                        <DropdownMenuItem asChild>
                            <Link to={toDashboard({ realm }).pathname}>
                                <GearIcon className="size-4 mr-2" />
                                {t("realmInfo")}
                            </Link>
                        </DropdownMenuItem>
                        {isMasterRealm && isManager && (
                            <DropdownMenuItem onClick={() => toggleClearCaches()}>
                                <TrashIcon className="size-4 mr-2" />
                                {t("clearCachesTitle")}
                            </DropdownMenuItem>
                        )}
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
