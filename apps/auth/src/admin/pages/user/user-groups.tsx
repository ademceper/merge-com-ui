import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Checkbox } from "@merge-rd/ui/components/checkbox";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge-rd/ui/components/empty";
import { Popover, PopoverContent, PopoverTrigger } from "@merge-rd/ui/components/popover";
import { Question } from "@phosphor-icons/react";
import { intersectionBy } from "lodash-es";
import { useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/admin/shared/ui/data-table";
import {
    getErrorDescription,
    getErrorMessage,
    useHelp
} from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../app/admin-client";
import { useAccess } from "../../app/providers/access/access";
import { useConfirmDialog } from "../../shared/ui/confirm-dialog/confirm-dialog";
import { GroupPath } from "../../shared/ui/group/group-path";
import { GroupPickerDialog } from "../../shared/ui/group/group-picker-dialog";
import { useUserGroups as useUserGroupsQuery } from "./api/use-user-groups";

type UserGroupsProps = {
    user: UserRepresentation;
};

export const UserGroups = ({ user }: UserGroupsProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();

    const [selectedGroups, setSelectedGroups] = useState<GroupRepresentation[]>([]);

    const [isDirectMembership, setDirectMembership] = useState(true);
    const [open, setOpen] = useState(false);

    const { enabled } = useHelp();

    const { hasAccess } = useAccess();
    const isManager = hasAccess("manage-users");

    const { data: userGroupsData, refetch: refetchGroups } = useUserGroupsQuery(
        user.id!,
        isDirectMembership
    );
    const groups = userGroupsData?.groups ?? [];
    const directMembershipList = userGroupsData?.directMembershipList ?? [];
    const refresh = () => refetchGroups();

    const toggleModal = () => {
        setOpen(!open);
    };

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: t("leaveGroup", {
            count: selectedGroups.length,
            name: selectedGroups[0]?.name
        }),
        messageKey: t("leaveGroupConfirmDialog", {
            count: selectedGroups.length,
            groupname: selectedGroups[0]?.name,
            username: user.username
        }),
        continueButtonLabel: "leave",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await Promise.all(
                    selectedGroups.map(group =>
                        adminClient.users.delFromGroup({
                            id: user.id!,
                            groupId: group.id!
                        })
                    )
                );

                setSelectedGroups([]);
                toast.success(t("removedGroupMembership"));
            } catch (error) {
                toast.error(
                    t("removedGroupMembershipError", { error: getErrorMessage(error) }),
                    { description: getErrorDescription(error) }
                );
            }
            refresh();
        }
    });

    const leave = (group: GroupRepresentation[]) => {
        setSelectedGroups(group);
        toggleDeleteDialog();
    };

    const addGroups = async (groups: GroupRepresentation[]): Promise<void> => {
        try {
            await Promise.all(
                groups.map(group =>
                    adminClient.users.addToGroup({
                        id: user.id!,
                        groupId: group.id!
                    })
                )
            );

            toast.success(t("addedGroupMembership"));
        } catch (error) {
            toast.error(
                t("addedGroupMembershipError", { error: getErrorMessage(error) }),
                { description: getErrorDescription(error) }
            );
        }
        refresh();
    };

    return (
        <>
            <DeleteConfirm />
            {open && (
                <GroupPickerDialog
                    id={user.id}
                    type="selectMany"
                    text={{
                        title: t("joinGroupsFor", { username: user.username }),
                        ok: "join"
                    }}
                    canBrowse={isManager}
                    onClose={() => setOpen(false)}
                    onConfirm={async (groups = []) => {
                        await addGroups(groups);
                        setOpen(false);
                    }}
                />
            )}
            <DataTable<GroupRepresentation>
                columns={[
                    {
                        id: "select",
                        header: "",
                        size: 40,
                        cell: ({ row }) => {
                            const disabled =
                                !isDirectMembership &&
                                directMembershipList.every(
                                    item => item.id !== row.original.id
                                );
                            return (
                                <Checkbox
                                    checked={selectedGroups.some(
                                        s => s.id === row.original.id
                                    )}
                                    disabled={disabled}
                                    onCheckedChange={() => {
                                        if (disabled) return;
                                        setSelectedGroups(prev =>
                                            prev.some(s => s.id === row.original.id)
                                                ? prev.filter(
                                                      s => s.id !== row.original.id
                                                  )
                                                : isDirectMembership
                                                  ? [...prev, row.original]
                                                  : intersectionBy(
                                                        [...prev, row.original],
                                                        directMembershipList,
                                                        "id"
                                                    )
                                        );
                                    }}
                                />
                            );
                        }
                    },
                    {
                        accessorKey: "name",
                        header: t("groupMembership"),
                        cell: ({ row }) => row.original.name || "-"
                    },
                    {
                        accessorKey: "path",
                        header: t("path"),
                        cell: ({ row }) => <GroupPath group={row.original} />
                    },
                    {
                        id: "leave",
                        header: "",
                        cell: ({ row }) => {
                            const canLeave =
                                directMembershipList.some(
                                    item => item.id === row.original.id
                                ) ||
                                directMembershipList.length === 0 ||
                                isDirectMembership;
                            return canLeave ? (
                                <Button
                                    data-testid={`leave-${row.original.name}`}
                                    onClick={() => leave([row.original])}
                                    variant="link"
                                    disabled={!user.access?.manageGroupMembership}
                                >
                                    {t("leave")}
                                </Button>
                            ) : (
                                "-"
                            );
                        }
                    }
                ]}
                data={groups}
                searchColumnId="name"
                searchPlaceholder={t("searchGroup")}
                emptyContent={
                    <Empty className="py-12">
                        <EmptyHeader>
                            <EmptyTitle>{t("noGroups")}</EmptyTitle>
                        </EmptyHeader>
                        <EmptyContent>
                            <EmptyDescription>{t("noGroupsText")}</EmptyDescription>
                        </EmptyContent>
                        <Button
                            className="mt-2"
                            onClick={toggleModal}
                            disabled={!user.access?.manageGroupMembership}
                        >
                            {t("joinGroup")}
                        </Button>
                    </Empty>
                }
                emptyMessage={t("noGroups")}
                className="keycloak_user-section_groups-table"
                toolbar={
                    <>
                        <Button
                            className="kc-join-group-button"
                            onClick={toggleModal}
                            data-testid="add-group-button"
                            disabled={!user.access?.manageGroupMembership}
                        >
                            {t("joinGroup")}
                        </Button>
                        <div className="flex items-center gap-2 mt-1">
                            <Checkbox
                                id="kc-direct-membership-checkbox"
                                checked={isDirectMembership}
                                onCheckedChange={() => {
                                    setDirectMembership(!isDirectMembership);
                                    refresh();
                                }}
                            />
                            <label
                                htmlFor="kc-direct-membership-checkbox"
                                className="text-sm"
                            >
                                {t("directMembership")}
                            </label>
                        </div>
                        <Button
                            onClick={() => leave(selectedGroups)}
                            data-testid="leave-group-button"
                            variant="link"
                            disabled={selectedGroups.length === 0}
                            className="ml-4"
                        >
                            {t("leave")}
                        </Button>
                        {enabled && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="link"
                                        className="kc-who-will-appear-button"
                                        key="who-will-appear-button"
                                    >
                                        <Question className="size-4" />
                                        {t("whoWillAppearLinkTextUsers")}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <div>{t("whoWillAppearPopoverTextUsers")}</div>
                                </PopoverContent>
                            </Popover>
                        )}
                    </>
                }
            />
        </>
    );
};
