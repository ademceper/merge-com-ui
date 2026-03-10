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
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import { Label } from "@merge-rd/ui/components/label";
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
import { DotsThree, DotsThreeVertical, Info } from "@phosphor-icons/react";
import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner
} from "@/shared/keycloak-ui-shared";
import { useAccess } from "@/admin/app/providers/access/access";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { toUser } from "@/admin/shared/lib/routes/user";
import { useToggle } from "@/admin/shared/lib/use-toggle";
import { emptyFormatter } from "@/admin/shared/lib/util";
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

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    const filteredMembers = useMemo(() => {
        if (!search) return members;
        const lower = search.toLowerCase();
        return members.filter(m => m.username?.toLowerCase().includes(lower));
    }, [members, search]);

    const totalCount = filteredMembers.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedMembers = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredMembers.slice(start, start + pageSize);
    }, [filteredMembers, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    if (!currentGroup) {
        return <KeycloakSpinner />;
    }

    const colCount = 6;

    const emptyContent = (
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
    );

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

            <div className="flex h-full w-full flex-col">
                <div className="flex items-center justify-between gap-2 py-2.5">
                    <div className="flex items-center gap-2">
                        <FacetedFormFilter
                            type="text"
                            size="small"
                            title={t("search")}
                            value={search}
                            onChange={value => setSearch(value)}
                            placeholder={t("search")}
                        />
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
                    </div>
                    {isManager && (
                        <div className="flex items-center gap-2">
                            <Button
                                data-testid="addMember"
                                variant="default"
                                size="sm"
                                onClick={() => setAddMembers(true)}
                            >
                                {t("addMember")}
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        data-testid="kebab"
                                        variant="ghost"
                                        size="icon-sm"
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
                        </div>
                    )}
                </div>

                <Table className="table-fixed" data-testid="members-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[5%]" />
                            <TableHead className="w-[25%]">{t("name")}</TableHead>
                            <TableHead className="w-[25%]">{t("email")}</TableHead>
                            <TableHead className="w-[15%]">{t("firstName")}</TableHead>
                            <TableHead className="w-[15%]">{t("lastName")}</TableHead>
                            <TableHead className="w-[15%]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedMembers.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={colCount}
                                    className="text-center text-muted-foreground"
                                >
                                    {filteredMembers.length === 0 && members.length === 0
                                        ? emptyContent
                                        : t("noUsersFound")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedMembers.map(member => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedRows.some(
                                                s => s.id === member.id
                                            )}
                                            onCheckedChange={() =>
                                                setSelectedRows(prev =>
                                                    prev.some(s => s.id === member.id)
                                                        ? prev.filter(
                                                              s => s.id !== member.id
                                                          )
                                                        : [...prev, member]
                                                )
                                            }
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <UserDetailLink {...member} />
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {emptyFormatter()(member.email)}
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {emptyFormatter()(member.firstName)}
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {emptyFormatter()(member.lastName)}
                                    </TableCell>
                                    <TableCell onClick={e => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon-sm">
                                                    <DotsThree
                                                        weight="bold"
                                                        className="size-4"
                                                    />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {isManager && (
                                                    <DropdownMenuItem
                                                        onClick={async () => {
                                                            try {
                                                                await removeMembersMutation([
                                                                    member.id!
                                                                ]);
                                                                toast.success(
                                                                    t("usersLeft", {
                                                                        count: 1
                                                                    })
                                                                );
                                                            } catch (error) {
                                                                toast.error(
                                                                    t("usersLeftError", {
                                                                        error: getErrorMessage(
                                                                            error
                                                                        )
                                                                    }),
                                                                    {
                                                                        description:
                                                                            getErrorDescription(
                                                                                error
                                                                            )
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
                                                        setSelectedUser(member);
                                                        toggleShowMemberships();
                                                    }}
                                                >
                                                    {t("showMemberships")}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
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
