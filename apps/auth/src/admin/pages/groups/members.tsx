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
import { useAccess } from "../../app/providers/access/access";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { toUser } from "../../shared/lib/routes/user";
import { useToggle } from "../../shared/lib/use-toggle";
import { emptyFormatter } from "../../shared/lib/util";
import { useAddGroupMembers } from "./hooks/use-add-group-members";
import { useGroup } from "./hooks/use-group";
import { useGroupMembers } from "./hooks/use-group-members";
import { useRemoveGroupMembers } from "./hooks/use-remove-group-members";
import { getLastId } from "./group-id-utils";
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

    const { mutateAsync: addMembersMutation } = useAddGroupMembers(id!);
    const { mutateAsync: removeMembersMutation } = useRemoveGroupMembers(id!);

    if (!currentGroup) {
        return <KeycloakSpinner />;
    }

    return (
        <>
            {addMembers && (
                <MemberModal
                    membersQueryKey={`group-${id}`}
                    fetchCurrentMembers={() =>
                        import("../../api/groups").then(m =>
                            m.fetchGroupMembers(id!, true, 0, 100)
                        )
                    }
                    onAdd={async selectedRows => {
                        try {
                            await addMembersMutation(selectedRows.map(u => u.id!));
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
                                                await removeMembersMutation([row.original.id!]);
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
                                                await removeMembersMutation(
                                                    selectedRows.map(u => u.id!)
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
