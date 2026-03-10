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
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import { Popover, PopoverContent, PopoverTrigger } from "@merge-rd/ui/components/popover";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TablePaginationFooter,
    TableRow
} from "@merge-rd/ui/components/table";
import { Question } from "@phosphor-icons/react";
import { intersectionBy } from "lodash-es";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    useHelp
} from "@/shared/keycloak-ui-shared";
import { useAccess } from "@/admin/app/providers/access/access";
import { useConfirmDialog } from "@/admin/shared/ui/confirm-dialog/confirm-dialog";
import { GroupPath } from "@/admin/shared/ui/group/group-path";
import { GroupPickerDialog } from "@/admin/shared/ui/group/group-picker-dialog";
import { useAddUserToGroups } from "./hooks/use-add-user-to-groups";
import { useRemoveUserFromGroups } from "./hooks/use-remove-user-from-groups";
import { useUserGroups as useUserGroupsQuery } from "./hooks/use-user-groups";

type UserGroupsProps = {
    user: UserRepresentation;
};

export const UserGroups = ({ user }: UserGroupsProps) => {

    const { t } = useTranslation();

    const [selectedGroups, setSelectedGroups] = useState<GroupRepresentation[]>([]);

    const [isDirectMembership, setDirectMembership] = useState(true);
    const [open, setOpen] = useState(false);

    const { enabled } = useHelp();

    const { hasAccess } = useAccess();
    const isManager = hasAccess("manage-users");

    const { mutateAsync: addUserToGroupsMut } = useAddUserToGroups(user.id!);
    const { mutateAsync: removeUserFromGroupsMut } = useRemoveUserFromGroups(user.id!);

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
                await removeUserFromGroupsMut(selectedGroups);

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
            await addUserToGroupsMut(groups);

            toast.success(t("addedGroupMembership"));
        } catch (error) {
            toast.error(
                t("addedGroupMembershipError", { error: getErrorMessage(error) }),
                { description: getErrorDescription(error) }
            );
        }
        refresh();
    };

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    const filteredGroups = useMemo(() => {
        if (!search) return groups;
        const lower = search.toLowerCase();
        return groups.filter((g: GroupRepresentation) =>
            g.name?.toLowerCase().includes(lower)
        );
    }, [groups, search]);

    const totalCount = filteredGroups.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedGroups = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredGroups.slice(start, start + pageSize);
    }, [filteredGroups, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const colCount = 4;

    const emptyContent = (
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
    );

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

            <div className="flex h-full w-full flex-col keycloak_user-section_groups-table">
                <div className="flex items-center justify-between gap-2 py-2.5">
                    <div className="flex items-center gap-2">
                        <FacetedFormFilter
                            type="text"
                            size="small"
                            title={t("search")}
                            value={search}
                            onChange={value => setSearch(value)}
                            placeholder={t("searchGroup")}
                        />
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
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            className="kc-join-group-button"
                            onClick={toggleModal}
                            data-testid="add-group-button"
                            size="sm"
                            disabled={!user.access?.manageGroupMembership}
                        >
                            {t("joinGroup")}
                        </Button>
                        <Button
                            onClick={() => leave(selectedGroups)}
                            data-testid="leave-group-button"
                            variant="link"
                            disabled={selectedGroups.length === 0}
                        >
                            {t("leave")}
                        </Button>
                    </div>
                </div>

                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[5%]" />
                            <TableHead className="w-[35%]">
                                {t("groupMembership")}
                            </TableHead>
                            <TableHead className="w-[40%]">{t("path")}</TableHead>
                            <TableHead className="w-[20%]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedGroups.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={colCount}
                                    className="text-center text-muted-foreground"
                                >
                                    {filteredGroups.length === 0 && groups.length === 0
                                        ? emptyContent
                                        : t("noGroups")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedGroups.map((group: GroupRepresentation) => {
                                const disabled =
                                    !isDirectMembership &&
                                    directMembershipList.every(
                                        item => item.id !== group.id
                                    );
                                const canLeave =
                                    directMembershipList.some(
                                        item => item.id === group.id
                                    ) ||
                                    directMembershipList.length === 0 ||
                                    isDirectMembership;
                                return (
                                    <TableRow key={group.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedGroups.some(
                                                    s => s.id === group.id
                                                )}
                                                disabled={disabled}
                                                onCheckedChange={() => {
                                                    if (disabled) return;
                                                    setSelectedGroups(prev =>
                                                        prev.some(
                                                            s => s.id === group.id
                                                        )
                                                            ? prev.filter(
                                                                  s =>
                                                                      s.id !== group.id
                                                              )
                                                            : isDirectMembership
                                                              ? [...prev, group]
                                                              : intersectionBy(
                                                                    [...prev, group],
                                                                    directMembershipList,
                                                                    "id"
                                                                )
                                                    );
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>{group.name || "-"}</TableCell>
                                        <TableCell>
                                            <GroupPath group={group} />
                                        </TableCell>
                                        <TableCell>
                                            {canLeave ? (
                                                <Button
                                                    data-testid={`leave-${group.name}`}
                                                    onClick={() => leave([group])}
                                                    variant="link"
                                                    disabled={
                                                        !user.access
                                                            ?.manageGroupMembership
                                                    }
                                                >
                                                    {t("leave")}
                                                </Button>
                                            ) : (
                                                "-"
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={colCount} className="p-0">
                                <TablePaginationFooter
                                    pageSize={pageSize}
                                    onPageSizeChange={setPageSize}
                                    onPreviousPage={() =>
                                        setCurrentPage(p => Math.max(0, p - 1))
                                    }
                                    onNextPage={() =>
                                        setCurrentPage(p =>
                                            Math.min(totalPages - 1, p + 1)
                                        )
                                    }
                                    hasPreviousPage={currentPage > 0}
                                    hasNextPage={currentPage < totalPages - 1}
                                    totalCount={totalCount}
                                />
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        </>
    );
};
