import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { SubGroupQuery } from "@keycloak/keycloak-admin-client/lib/resources/groups";
import { getErrorDescription, getErrorMessage, useFetch } from "../../shared/keycloak-ui-shared";
import { DataTable, DataTableRowActions } from "@merge/ui/components/table";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge/ui/components/empty";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { Checkbox } from "@merge/ui/components/checkbox";
import { Label } from "@merge/ui/components/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@merge/ui/components/dropdown-menu";
import { DotsThreeVertical, Info } from "@phosphor-icons/react";
import { uniqBy } from "lodash-es";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { KeycloakSpinner } from "../../shared/keycloak-ui-shared";
import { useAccess } from "../context/access/Access";
import { useRealm } from "../context/realm-context/RealmContext";
import { toUser } from "../user/routes/User";
import { emptyFormatter } from "../util";
import { MemberModal } from "./MembersModal";
import { useSubGroups } from "./SubGroupsContext";
import { getLastId } from "./groupIdUtils";
import { MembershipsModal } from "./MembershipsModal";
import useToggle from "../utils/useToggle";

const UserDetailLink = (user: UserRepresentation) => {
    const { realm } = useRealm();
    const { t } = useTranslation();
    return (
        <Link key={user.id} to={toUser({ realm, id: user.id!, tab: "settings" })}>
            {user.username}{" "}
            {!user.enabled && (
                <Label className="text-red-500">
                    <Info className="size-4 inline mr-1" />
                    {t("disabled")}
                </Label>
            )}
        </Link>
    );
};

export const Members = () => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
const location = useLocation();
    const id = getLastId(location.pathname);
    const [includeSubGroup, setIncludeSubGroup] = useState(false);
    const { currentGroup: group } = useSubGroups();
    const [currentGroup, setCurrentGroup] = useState<GroupRepresentation>();
    const [addMembers, setAddMembers] = useState(false);
    const [_isKebabOpen, _setIsKebabOpen] = useState(false);
    const [selectedRows, setSelectedRows] = useState<UserRepresentation[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserRepresentation>();
    const [showMemberships, toggleShowMemberships] = useToggle();
    const { hasAccess } = useAccess();

    useFetch(() => adminClient.groups.findOne({ id: group()!.id! }), setCurrentGroup, []);

    const isManager = hasAccess("manage-users") || currentGroup?.access!.manageMembership;

    const [key, setKey] = useState(0);
    const refresh = () => setKey(new Date().getTime());

    // this queries the subgroups using the new search paradigm but doesn't
    // account for pagination and therefore isn't going to scale well
    const getSubGroups = async (groupId?: string, count = 0) => {
        let nestedGroups: GroupRepresentation[] = [];
        if (!count || !groupId) {
            return nestedGroups;
        }
        const args: SubGroupQuery = {
            parentId: groupId,
            first: 0,
            max: count
        };
        const subGroups: GroupRepresentation[] =
            await adminClient.groups.listSubGroups(args);
        nestedGroups = nestedGroups.concat(subGroups);

        await Promise.all(subGroups.map(g => getSubGroups(g.id, g.subGroupCount))).then(
            (values: GroupRepresentation[][]) => {
                values.forEach(groups => (nestedGroups = nestedGroups.concat(groups)));
            }
        );
        return nestedGroups;
    };

    const [members, setMembers] = useState<UserRepresentation[]>([]);

    useFetch(
        async () => {
            if (!id) return [];
            let list = await adminClient.groups.listMembers({ id: id!, briefRepresentation: true, first: 0, max: 500 });
            if (includeSubGroup && currentGroup?.subGroupCount && currentGroup.id) {
                const subGroups = await getSubGroups(currentGroup.id, currentGroup.subGroupCount);
                const values = await Promise.all(subGroups.map(g => adminClient.groups.listMembers({ id: g.id!, briefRepresentation: true })));
                values.forEach(users => (list = list.concat(users)));
                list = uniqBy(list, member => member.username);
            }
            return list;
        },
        setMembers,
        [id, key, includeSubGroup, currentGroup?.id, currentGroup?.subGroupCount]
    );

    if (!currentGroup) {
        return <KeycloakSpinner />;
    }

    return (
        <>
            {addMembers && (
                <MemberModal
                    membersQuery={(first, max) =>
                        adminClient.groups.listMembers({ id: id!, first, max })
                    }
                    onAdd={async selectedRows => {
                        try {
                            await Promise.all(
                                selectedRows.map(user =>
                                    adminClient.users.addToGroup({
                                        id: user.id!,
                                        groupId: id!
                                    })
                                )
                            );
                            toast.success(t("usersAdded", { count: selectedRows.length }));
                        } catch (error) {
                            toast.error(t("usersAddedError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
                        }
                    }}
                    onClose={() => {
                        setAddMembers(false);
                        refresh();
                    }}
                />
            )}
            {showMemberships && (
                <MembershipsModal
                    onClose={() => {
                        toggleShowMemberships();
                    }}
                    user={selectedUser!}
                />
            )}
            <DataTable<UserRepresentation>
                data-testid="members-table"
                key={`${id}${key}${includeSubGroup}`}
                columns={[
                    {
                        id: "select",
                        header: "",
                        size: 40,
                        cell: ({ row }) => (
                            <Checkbox
                                checked={selectedRows.some(s => s.id === row.original.id)}
                                onCheckedChange={() =>
                                    setSelectedRows(prev =>
                                        prev.some(s => s.id === row.original.id)
                                            ? prev.filter(s => s.id !== row.original.id)
                                            : [...prev, row.original]
                                    )
                                }
                            />
                        )
                    },
                    { accessorKey: "username", header: t("name"), cell: ({ row }) => <UserDetailLink {...row.original} /> },
                    { accessorKey: "email", header: t("email"), cell: ({ getValue }) => emptyFormatter()(getValue()) },
                    { accessorKey: "firstName", header: t("firstName"), cell: ({ getValue }) => emptyFormatter()(getValue()) },
                    { accessorKey: "lastName", header: t("lastName"), cell: ({ getValue }) => emptyFormatter()(getValue()) },
                    {
                        id: "actions",
                        cell: ({ row }) => (
                            <DataTableRowActions row={row}>
                                {isManager && (
                                    <DropdownMenuItem
                                        onClick={async () => {
                                            try {
                                                await adminClient.users.delFromGroup({ id: row.original.id!, groupId: id! });
                                                toast.success(t("usersLeft", { count: 1 }));
                                            } catch (error) {
                                                toast.error(t("usersLeftError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
                                            }
                                            refresh();
                                        }}
                                    >
                                        {t("leave")}
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => { setSelectedUser(row.original); toggleShowMemberships(); }}>
                                    {t("showMemberships")}
                                </DropdownMenuItem>
                            </DataTableRowActions>
                        )
                    }
                ]}
                data={members}
                searchColumnId="username"
                searchPlaceholder={t("search")}
                emptyContent={
                    <Empty className="py-12">
                        <EmptyHeader><EmptyTitle>{t("noUsersFound")}</EmptyTitle></EmptyHeader>
                        <EmptyContent>
                            <EmptyDescription>{isManager ? t("emptyInstructions") : undefined}</EmptyDescription>
                            {isManager && <Button className="mt-2" onClick={() => setAddMembers(true)}>{t("addMember")}</Button>}
                            <Button variant="outline" className="mt-2 ml-2" onClick={() => setIncludeSubGroup(true)}>{t("includeSubGroups")}</Button>
                        </EmptyContent>
                    </Empty>
                }
                emptyMessage={t("noUsersFound")}
                toolbar={
                    isManager && (
                        <>
                            <Button data-testid="addMember" variant="default" onClick={() => setAddMembers(true)}>{t("addMember")}</Button>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    data-testid="includeSubGroupsCheck"
                                    id="kc-include-sub-groups"
                                    checked={includeSubGroup}
                                    onCheckedChange={() => setIncludeSubGroup(!includeSubGroup)}
                                />
                                <label htmlFor="kc-include-sub-groups">{t("includeSubGroups")}</label>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button data-testid="kebab" variant="ghost" disabled={selectedRows.length === 0} aria-label="Actions">
                                        <DotsThreeVertical className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem
                                        onClick={async () => {
                                            try {
                                                await Promise.all(selectedRows.map(user => adminClient.users.delFromGroup({ id: user.id!, groupId: id! })));
                                                toast.success(t("usersLeft", { count: selectedRows.length }));
                                            } catch (error) {
                                                toast.error(t("usersLeftError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
                                            }
                                            refresh();
                                        }}
                                    >
                                        {t("leave")}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )
                }
            />
        </>
    );
};
