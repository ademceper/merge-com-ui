import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Checkbox } from "@merge-rd/ui/components/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge-rd/ui/components/empty";
import { Label } from "@merge-rd/ui/components/label";
import { DotsThreeVertical, Info } from "@phosphor-icons/react";
import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DataTable, DataTableRowActions } from "@/admin/shared/ui/data-table";
import {
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner
} from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../app/admin-client";
import { useAccess } from "../../app/providers/access/access";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import useToggle from "../../shared/lib/useToggle";
import { emptyFormatter } from "../../shared/lib/util";
import { toUser } from "../../shared/lib/routes/user";
import { useGroup } from "./api/use-group";
import { useGroupMembers } from "./api/use-group-members";
import { getLastId } from "./groupIdUtils";
import { MemberModal } from "./members-modal";
import { MembershipsModal } from "./memberships-modal";
import { useSubGroups } from "./sub-groups-context";

const UserDetailLink = (user: UserRepresentation) => {
    const { realm } = useRealm();
    const { t } = useTranslation();
    return (
        <Link
            key={user.id}
            to={toUser({ realm, id: user.id!, tab: "settings" }) as string}
        >
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
    const [addMembers, setAddMembers] = useState(false);
    const [_isKebabOpen, _setIsKebabOpen] = useState(false);
    const [selectedRows, setSelectedRows] = useState<UserRepresentation[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserRepresentation>();
    const [showMemberships, toggleShowMemberships] = useToggle();
    const { hasAccess } = useAccess();

    const { data: currentGroup } = useGroup(group()!.id!);

    const isManager = hasAccess("manage-users") || currentGroup?.access!.manageMembership;

    const { data: members = [], refetch: refreshMembers } = useGroupMembers(id, {
        includeSubGroup,
        currentGroup
    });
    const refresh = () => refreshMembers();

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
                            toast.success(
                                t("usersAdded", { count: selectedRows.length })
                            );
                        } catch (error) {
                            toast.error(
                                t("usersAddedError", { error: getErrorMessage(error) }),
                                { description: getErrorDescription(error) }
                            );
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
                key={`${id}${includeSubGroup}`}
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
                    {
                        accessorKey: "username",
                        header: t("name"),
                        cell: ({ row }) => <UserDetailLink {...row.original} />
                    },
                    {
                        accessorKey: "email",
                        header: t("email"),
                        cell: ({ getValue }) => emptyFormatter()(getValue())
                    },
                    {
                        accessorKey: "firstName",
                        header: t("firstName"),
                        cell: ({ getValue }) => emptyFormatter()(getValue())
                    },
                    {
                        accessorKey: "lastName",
                        header: t("lastName"),
                        cell: ({ getValue }) => emptyFormatter()(getValue())
                    },
                    {
                        id: "actions",
                        cell: ({ row }) => (
                            <DataTableRowActions row={row}>
                                {isManager && (
                                    <DropdownMenuItem
                                        onClick={async () => {
                                            try {
                                                await adminClient.users.delFromGroup({
                                                    id: row.original.id!,
                                                    groupId: id!
                                                });
                                                toast.success(
                                                    t("usersLeft", { count: 1 })
                                                );
                                            } catch (error) {
                                                toast.error(
                                                    t("usersLeftError", {
                                                        error: getErrorMessage(error)
                                                    }),
                                                    {
                                                        description:
                                                            getErrorDescription(error)
                                                    }
                                                );
                                            }
                                            refresh();
                                        }}
                                    >
                                        {t("leave")}
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    onClick={() => {
                                        setSelectedUser(row.original);
                                        toggleShowMemberships();
                                    }}
                                >
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
                        <EmptyHeader>
                            <EmptyTitle>{t("noUsersFound")}</EmptyTitle>
                        </EmptyHeader>
                        <EmptyContent>
                            <EmptyDescription>
                                {isManager ? t("emptyInstructions") : undefined}
                            </EmptyDescription>
                            {isManager && (
                                <Button
                                    className="mt-2"
                                    onClick={() => setAddMembers(true)}
                                >
                                    {t("addMember")}
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                className="mt-2 ml-2"
                                onClick={() => setIncludeSubGroup(true)}
                            >
                                {t("includeSubGroups")}
                            </Button>
                        </EmptyContent>
                    </Empty>
                }
                emptyMessage={t("noUsersFound")}
                toolbar={
                    isManager && (
                        <>
                            <Button
                                data-testid="addMember"
                                variant="default"
                                onClick={() => setAddMembers(true)}
                            >
                                {t("addMember")}
                            </Button>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    data-testid="includeSubGroupsCheck"
                                    id="kc-include-sub-groups"
                                    checked={includeSubGroup}
                                    onCheckedChange={() =>
                                        setIncludeSubGroup(!includeSubGroup)
                                    }
                                />
                                <label htmlFor="kc-include-sub-groups">
                                    {t("includeSubGroups")}
                                </label>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        data-testid="kebab"
                                        variant="ghost"
                                        disabled={selectedRows.length === 0}
                                        aria-label="Actions"
                                    >
                                        <DotsThreeVertical className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem
                                        onClick={async () => {
                                            try {
                                                await Promise.all(
                                                    selectedRows.map(user =>
                                                        adminClient.users.delFromGroup({
                                                            id: user.id!,
                                                            groupId: id!
                                                        })
                                                    )
                                                );
                                                toast.success(
                                                    t("usersLeft", {
                                                        count: selectedRows.length
                                                    })
                                                );
                                            } catch (error) {
                                                toast.error(
                                                    t("usersLeftError", {
                                                        error: getErrorMessage(error)
                                                    }),
                                                    {
                                                        description:
                                                            getErrorDescription(error)
                                                    }
                                                );
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
