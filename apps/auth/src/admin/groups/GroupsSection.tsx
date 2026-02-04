/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/groups/GroupsSection.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useFetch } from "../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { DropdownMenuItem } from "@merge/ui/components/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge/ui/components/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@merge/ui/components/tooltip";
import { CaretLeft, TreeStructure } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { GroupBreadCrumbs } from "../components/bread-crumb/GroupBreadCrumbs";
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

    const [open, toggle] = useToggle(true);
    const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);

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
            <div className="p-0 bg-muted/30">
                <div className="flex min-h-0" key={key}>
                    {open && (
                        <div className="flex shrink-0 border-r bg-background w-64 min-h-0 flex flex-col">
                            <div className="p-2">
                                <GroupTree
                                    refresh={refresh}
                                    canViewDetails={canViewDetails}
                                />
                            </div>
                        </div>
                    )}
                    <div className="flex flex-1 flex-col min-w-0">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label={open ? t("hide") : t("show")}
                                        onClick={toggle}
                                    >
                                        {open ? <CaretLeft className="size-5" /> : <TreeStructure className="size-5" />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>{open ? t("hide") : t("show")}</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <GroupBreadCrumbs />
                        <ViewHeader
                            titleKey={!id ? "groups" : currentGroup()?.name!}
                            subKey={!id ? "groupsDescription" : ""}
                            helpUrl={!id ? helpUrls.groupsUrl : ""}
                            divider={!id}
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
                                            {t("edit")}
                                        </DropdownMenuItem>,
                                        <DropdownMenuItem
                                            data-testid="deleteGroup"
                                            key="deleteGroup"
                                            onClick={toggleDeleteOpen}
                                        >
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
                            <Tabs value={String(activeTab)} onValueChange={v => setActiveTab(Number(v))} className="w-full">
                                <TabsList className="w-full flex-wrap">
                                    <TabsTrigger value="0" data-testid="groups">{t("childGroups")}</TabsTrigger>
                                    {canViewMembers && (
                                        <TabsTrigger value="1" data-testid="members">{t("members")}</TabsTrigger>
                                    )}
                                    <TabsTrigger value="2" data-testid="attributesTab">{t("attributes")}</TabsTrigger>
                                    {canViewRoles && (
                                        <TabsTrigger value="3" data-testid="role-mapping-tab">{t("roleMapping")}</TabsTrigger>
                                    )}
                                    {canViewPermissions && (
                                        <TabsTrigger value="4" data-testid="permissionsTab">{t("permissions")}</TabsTrigger>
                                    )}
                                    {hasAccess("view-events") && (
                                        <TabsTrigger value="5" data-testid="admin-events-tab">{t("adminEvents")}</TabsTrigger>
                                    )}
                                </TabsList>
                                <TabsContent value="0">
                                    <GroupTable refresh={refresh} />
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
                        {subGroups.length === 0 && <GroupTable refresh={refresh} />}
                    </div>
                </div>
            </div>
        </div>
    );
}
