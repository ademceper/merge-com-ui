import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useFetch } from "../../shared/keycloak-ui-shared";
import { DropdownMenuItem } from "@merge/ui/components/dropdown-menu";
import { Sheet, SheetContent } from "@merge/ui/components/sheet";
import { SidebarProvider, useSidebar } from "@merge/ui/components/sidebar";
import { Button } from "@merge/ui/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge/ui/components/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@merge/ui/components/tooltip";
import { CaretLeft, CaretRight, DotsThreeVertical, PencilSimple, Trash } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { PermissionsTab } from "../components/permission-tab/PermissionTab";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { useAccess } from "../context/access/Access";
import { useRealm } from "../context/realm-context/RealmContext";
import { AdminEvents } from "../events/AdminEvents";
import helpUrls from "../help-urls";
import useIsFeatureEnabled, { Feature } from "../utils/useIsFeatureEnabled";
import useToggle from "../utils/useToggle";
import { GroupAttributes } from "./GroupAttributes";
import { GroupRoleMapping } from "./GroupRoleMapping";
import { GroupTable } from "./GroupTable";
import { GroupsModal } from "./GroupsModal";
import { Members } from "./Members";
import { useSubGroups } from "./SubGroupsContext";
import { DeleteGroup } from "./components/DeleteGroup";
import { GroupTree } from "./components/GroupTree";
import { getId, getLastId } from "./groupIdUtils";
import { toGroups } from "./routes/Groups";
import { cn } from "@merge/ui/lib/utils";

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
                <div className="flex flex-1 flex-col min-h-0 overflow-auto p-2 pt-12">{children}</div>
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

export default function GroupsSection() {
    const { adminClient } = useAdminClient();

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

    useFetch(
        async () => {
            const ids = getId(location.pathname);
            const isNavigationStateInValid = ids && ids.length > subGroups.length;

            if (isNavigationStateInValid) {
                const groups: GroupRepresentation[] = [];
                for (const i of ids!) {
                    let group = undefined;
                    if (i !== "search") {
                        group = await adminClient.groups.findOne({ id: i });
                    } else {
                        group = { name: t("searchGroups"), id: "search" };
                    }
                    if (group) {
                        groups.push(group);
                    } else {
                        throw new Error(t("notFound"));
                    }
                }
                return groups;
            }
            return [];
        },
        (groups: GroupRepresentation[]) => {
            if (groups.length) setSubGroups(groups);
        },
        [id]
    );

    return (
        <div>
            <DeleteGroup
                show={deleteOpen}
                toggleDialog={toggleDeleteOpen}
                selectedRows={[currentGroup()!]}
                refresh={() => {
                    navigate(toGroups({ realm }));
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
            <div className="py-6 px-0">
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
                                <ViewHeader
                            titleKey={!id ? "groups" : currentGroup()?.name!}
                            subKey={!id ? "groupsDescription" : ""}
                            helpUrl={!id ? helpUrls.groupsUrl : ""}
                            divider
                            dropdownIcon={id && canManageGroup ? <DotsThreeVertical className="size-5" /> : undefined}
                            dropdownItems={
                                id && canManageGroup
                                    ? [
                                        <DropdownMenuItem
                                            data-testid="renameGroupAction"
                                            key="renameGroup"
                                            onClick={() =>
                                                setRename(currentGroup())
                                            }
                                        >
                                            <PencilSimple className="size-4 shrink-0" />
                                            {t("edit")}
                                        </DropdownMenuItem>,
                                        <DropdownMenuItem
                                            data-testid="deleteGroup"
                                            key="deleteGroup"
                                            onClick={toggleDeleteOpen}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <Trash className="size-4 shrink-0" />
                                            {t("deleteGroup")}
                                        </DropdownMenuItem>
                                    ]
                                    : undefined
                            }
                        />
                        <div className="pt-0">
                            {currentGroup()?.description}
                        </div>
                        {subGroups.length > 0 && (
                            <Tabs value={String(activeTab)} onValueChange={v => setActiveTab(Number(v))} className="w-full mt-6">
                                <TabsList
                                    variant="line"
                                    className="mb-4 w-full flex-nowrap overflow-x-auto justify-start gap-0 h-auto p-0 pb-1.5 bg-transparent rounded-none [-webkit-overflow-scrolling:touch] [&>*]:flex-shrink-0"
                                >
                                    <TabsTrigger value="0" data-testid="groups" className="whitespace-nowrap">{t("childGroups")}</TabsTrigger>
                                    {canViewMembers && (
                                        <TabsTrigger value="1" data-testid="members" className="whitespace-nowrap">{t("members")}</TabsTrigger>
                                    )}
                                    <TabsTrigger value="2" data-testid="attributesTab" className="whitespace-nowrap">{t("attributes")}</TabsTrigger>
                                    {canViewRoles && (
                                        <TabsTrigger value="3" data-testid="role-mapping-tab" className="whitespace-nowrap">{t("roleMapping")}</TabsTrigger>
                                    )}
                                    {canViewPermissions && (
                                        <TabsTrigger value="4" data-testid="permissionsTab" className="whitespace-nowrap">{t("permissions")}</TabsTrigger>
                                    )}
                                    {hasAccess("view-events") && (
                                        <TabsTrigger value="5" data-testid="admin-events-tab" className="whitespace-nowrap">{t("adminEvents")}</TabsTrigger>
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
                                        <Tabs value={activeEventsTab} onValueChange={setActiveEventsTab}>
                                            <TabsList>
                                                <TabsTrigger value="adminEvents">{t("adminEvents")}</TabsTrigger>
                                                <TabsTrigger value="membershipEvents">{t("membershipEvents")}</TabsTrigger>
                                                <TabsTrigger value="childGroupEvents">{t("childGroupEvents")}</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="adminEvents">
                                                <AdminEvents resourcePath={`groups/${id}`} />
                                            </TabsContent>
                                            <TabsContent value="membershipEvents">
                                                <AdminEvents resourcePath={`users/*/groups/${id}`} />
                                            </TabsContent>
                                            <TabsContent value="childGroupEvents">
                                                <AdminEvents resourcePath={`groups/${id}/children`} />
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
