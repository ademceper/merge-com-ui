import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button, buttonVariants } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { Sheet, SheetContent } from "@merge-rd/ui/components/sheet";
import { SidebarProvider, useSidebar } from "@merge-rd/ui/components/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge-rd/ui/components/tabs";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@merge-rd/ui/components/tooltip";
import { cn } from "@merge-rd/ui/lib/utils";
import {
    CaretLeft,
    CaretRight,
    DotsThreeVertical,
    PencilSimple,
    Trash
} from "@phosphor-icons/react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { useAccess } from "@/admin/app/providers/access/access";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { toGroups } from "@/admin/shared/lib/routes/groups";
import { useIsFeatureEnabled, Feature } from "@/admin/shared/lib/use-is-feature-enabled";
import { useToggle } from "@/admin/shared/lib/use-toggle";
import { PermissionsTab } from "@/admin/shared/ui/permission-tab/permission-tab";
import { AdminEvents } from "../events/admin-events";
import { useNavigationPath } from "./hooks/use-navigation-path";
import { DeleteGroup } from "./components/delete-group";
import { GroupTree } from "./components/group-tree";
import { GroupAttributes } from "./group-attributes";
import { GroupRoleMapping } from "./group-role-mapping";
import { GroupTable } from "./group-table";
import { getId, getLastId } from "./group-id-utils";
import { GroupsModal } from "./groups-modal";
import { Members } from "./members";
import { useSubGroups } from "./sub-groups-context";

/** Desktop: sayfa akışında açılıp kapanan panel. Mobil: render edilmez (yerine Sheet kullanılır). */
function GroupsSidebarPanel({ children }: { children: ReactNode }) {
    const { state, isMobile } = useSidebar();
    if (isMobile) return null;
    const collapsed = state === "collapsed";
    return (
        <div
            className={cn(
                "flex shrink-0 flex-col border-sidebar-border min-h-0 overflow-hidden transition-[width] duration-200 ease-linear",
                collapsed ? "w-0 min-w-0 border-r-0" : "w-64 border-r"
            )}
            aria-hidden={collapsed}
        >
            <div className="flex min-h-0 w-64 flex-col overflow-auto p-2">{children}</div>
        </div>
    );
}

/** Mobilde gruplar paneli overlay Sheet olarak açılır; sayfa yapısı bozulmaz. */
function GroupsMobileSheet({
    children,
    open,
    onOpenChange
}: {
    children: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { isMobile } = useSidebar();
    if (!isMobile) return null;
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="left"
                className="w-64 max-w-[85vw] p-0 flex flex-col [&>button]:hidden"
                showCloseButton={true}
            >
                <div className="flex flex-1 flex-col min-h-0 overflow-auto p-2 pt-12">
                    {children}
                </div>
            </SheetContent>
        </Sheet>
    );
}

function GroupsSidebarTrigger() {
    const { state, toggleSidebar, isMobile, openMobile } = useSidebar();
    const { t } = useTranslation();
    const expanded = isMobile ? openMobile : state === "expanded";
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label={expanded ? t("hide") : t("show")}
                        onClick={toggleSidebar}
                        data-sidebar="trigger"
                    >
                        {expanded ? (
                            <CaretLeft className="size-5" />
                        ) : (
                            <CaretRight className="size-5" />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>{expanded ? t("hide") : t("show")}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

/** SidebarProvider içinde useSidebar ile mobil/desktop ayrımı ve Sheet kullanımı. */
function GroupsSectionLayout({
    groupTree,
    mainContent
}: {
    groupTree: ReactNode;
    mainContent: ReactNode;
}) {
    const { isMobile, openMobile, setOpenMobile } = useSidebar();
    const location = useLocation();
    useEffect(() => {
        if (isMobile) setOpenMobile(false);
    }, [isMobile, location.pathname, setOpenMobile]);
    return (
        <>
            <GroupsMobileSheet open={openMobile} onOpenChange={setOpenMobile}>
                {groupTree}
            </GroupsMobileSheet>
            <GroupsSidebarPanel>{groupTree}</GroupsSidebarPanel>
            <div
                className={cn(
                    "flex min-w-0 flex-1 flex-col overflow-hidden",
                    !isMobile && "pl-4"
                )}
            >
                {mainContent}
            </div>
        </>
    );
}

export function GroupsSection() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(0);

    const { subGroups, setSubGroups, currentGroup } = useSubGroups();
    const { realm } = useRealm();

    const [rename, setRename] = useState<GroupRepresentation>();
    const [deleteOpen, toggleDeleteOpen] = useToggle();

    const navigate = useNavigate();
    const location = useLocation();
    const id = getLastId(location.pathname);

    const [key, setKey] = useState(0);
    const refresh = useCallback(() => setKey(prev => prev + 1), []);

    const { hasAccess, hasSomeAccess } = useAccess();
    const isFeatureEnabled = useIsFeatureEnabled();
    const canViewPermissions =
        isFeatureEnabled(Feature.AdminFineGrainedAuthz) &&
        hasAccess("manage-authorization", "manage-users", "manage-clients");
    const canManageGroup =
        hasAccess("manage-users") || currentGroup()?.access?.manage || false;
    const canViewRoles = hasSomeAccess("view-users", "manage-users");
    const canViewDetails =
        hasAccess("query-groups", "view-users") ||
        hasAccess("manage-users", "query-groups");
    const canViewMembers =
        hasAccess("view-users") ||
        currentGroup()?.access?.viewMembers ||
        currentGroup()?.access?.manageMembers;

    const [activeEventsTab, setActiveEventsTab] = useState("adminEvents");

    const navigationIds = (() => {
        const ids = getId(location.pathname);
        const isNavigationStateInValid = ids && ids.length > subGroups.length;
        return isNavigationStateInValid ? ids : undefined;
    })();

    const { data: navigationGroups } = useNavigationPath(navigationIds);

    useEffect(() => {
        if (navigationGroups && navigationGroups.length > 0) {
            setSubGroups(navigationGroups);
        }
    }, [navigationGroups, setSubGroups]);

    return (
        <div>
            <DeleteGroup
                show={deleteOpen}
                toggleDialog={toggleDeleteOpen}
                selectedRows={[currentGroup()!]}
                refresh={() => {
                    navigate({ to: toGroups({ realm }) as string });
                    refresh();
                }}
            />
            {rename && (
                <GroupsModal
                    id={id}
                    rename={rename}
                    refresh={group => {
                        refresh();
                        setSubGroups([
                            ...subGroups.slice(0, subGroups.length - 1),
                            group!
                        ]);
                    }}
                    handleModalToggle={() => setRename(undefined)}
                />
            )}
            <div className="p-0">
                <SidebarProvider defaultOpen={true} className="flex min-h-0 w-full">
                    <GroupsSectionLayout
                        groupTree={
                            <GroupTree
                                key={key}
                                refresh={refresh}
                                canViewDetails={canViewDetails}
                            />
                        }
                        mainContent={
                            <>
                                <div className="flex min-w-0 flex-wrap items-center gap-2">
                                    <GroupsSidebarTrigger />
                                </div>
                                {id && canManageGroup && (
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex flex-wrap items-center gap-2" />
                                        <div className="flex items-center gap-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    data-testid="action-dropdown"
                                                    className={buttonVariants({
                                                        variant: "ghost",
                                                        size: "icon"
                                                    })}
                                                >
                                                    <DotsThreeVertical className="size-5" />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        data-testid="renameGroupAction"
                                                        key="renameGroup"
                                                        onClick={() =>
                                                            setRename(currentGroup())
                                                        }
                                                    >
                                                        <PencilSimple className="size-4 shrink-0" />
                                                        {t("edit")}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        data-testid="deleteGroup"
                                                        key="deleteGroup"
                                                        onClick={toggleDeleteOpen}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash className="size-4 shrink-0" />
                                                        {t("deleteGroup")}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                )}
                                <div className="pt-0">{currentGroup()?.description}</div>
                                {subGroups.length > 0 && (
                                    <Tabs
                                        value={String(activeTab)}
                                        onValueChange={v => setActiveTab(Number(v))}
                                        className="w-full mt-6"
                                    >
                                        <TabsList
                                            variant="line"
                                            className="mb-4 w-full flex-nowrap overflow-x-auto justify-start gap-0 h-auto p-0 pb-1.5 bg-transparent rounded-none [-webkit-overflow-scrolling:touch] [&>*]:flex-shrink-0"
                                        >
                                            <TabsTrigger
                                                value="0"
                                                data-testid="groups"
                                                className="whitespace-nowrap"
                                            >
                                                {t("childGroups")}
                                            </TabsTrigger>
                                            {canViewMembers && (
                                                <TabsTrigger
                                                    value="1"
                                                    data-testid="members"
                                                    className="whitespace-nowrap"
                                                >
                                                    {t("members")}
                                                </TabsTrigger>
                                            )}
                                            <TabsTrigger
                                                value="2"
                                                data-testid="attributesTab"
                                                className="whitespace-nowrap"
                                            >
                                                {t("attributes")}
                                            </TabsTrigger>
                                            {canViewRoles && (
                                                <TabsTrigger
                                                    value="3"
                                                    data-testid="role-mapping-tab"
                                                    className="whitespace-nowrap"
                                                >
                                                    {t("roleMapping")}
                                                </TabsTrigger>
                                            )}
                                            {canViewPermissions && (
                                                <TabsTrigger
                                                    value="4"
                                                    data-testid="permissionsTab"
                                                    className="whitespace-nowrap"
                                                >
                                                    {t("permissions")}
                                                </TabsTrigger>
                                            )}
                                            {hasAccess("view-events") && (
                                                <TabsTrigger
                                                    value="5"
                                                    data-testid="admin-events-tab"
                                                    className="whitespace-nowrap"
                                                >
                                                    {t("adminEvents")}
                                                </TabsTrigger>
                                            )}
                                        </TabsList>
                                        <TabsContent value="0">
                                            <GroupTable key={key} refresh={refresh} />
                                        </TabsContent>
                                        {canViewMembers && (
                                            <TabsContent value="1">
                                                <Members />
                                            </TabsContent>
                                        )}
                                        <TabsContent value="2">
                                            <GroupAttributes />
                                        </TabsContent>
                                        {canViewRoles && (
                                            <TabsContent value="3">
                                                <GroupRoleMapping
                                                    id={id!}
                                                    name={currentGroup()?.name!}
                                                    canManageGroup={canManageGroup}
                                                />
                                            </TabsContent>
                                        )}
                                        {canViewPermissions && (
                                            <TabsContent value="4">
                                                <PermissionsTab id={id} type="groups" />
                                            </TabsContent>
                                        )}
                                        {hasAccess("view-events") && (
                                            <TabsContent value="5">
                                                <Tabs
                                                    value={activeEventsTab}
                                                    onValueChange={setActiveEventsTab}
                                                >
                                                    <TabsList>
                                                        <TabsTrigger value="adminEvents">
                                                            {t("adminEvents")}
                                                        </TabsTrigger>
                                                        <TabsTrigger value="membershipEvents">
                                                            {t("membershipEvents")}
                                                        </TabsTrigger>
                                                        <TabsTrigger value="childGroupEvents">
                                                            {t("childGroupEvents")}
                                                        </TabsTrigger>
                                                    </TabsList>
                                                    <TabsContent value="adminEvents">
                                                        <AdminEvents
                                                            resourcePath={`groups/${id}`}
                                                        />
                                                    </TabsContent>
                                                    <TabsContent value="membershipEvents">
                                                        <AdminEvents
                                                            resourcePath={`users/*/groups/${id}`}
                                                        />
                                                    </TabsContent>
                                                    <TabsContent value="childGroupEvents">
                                                        <AdminEvents
                                                            resourcePath={`groups/${id}/children`}
                                                        />
                                                    </TabsContent>
                                                </Tabs>
                                            </TabsContent>
                                        )}
                                    </Tabs>
                                )}
                                {subGroups.length === 0 && (
                                    <div className="mt-4">
                                        <GroupTable key={key} refresh={refresh} />
                                    </div>
                                )}
                            </>
                        }
                    />
                </SidebarProvider>
            </div>
        </div>
    );
}
