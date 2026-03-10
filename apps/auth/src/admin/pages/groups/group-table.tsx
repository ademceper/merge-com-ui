import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@merge-rd/ui/components/alert-dialog";
import { Button } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
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
import {
    ArrowsDownUp,
    CopySimple,
    DotsThree,
    PencilSimple,
    Plus,
    Trash
} from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getErrorDescription, getErrorMessage } from "@/shared/keycloak-ui-shared";
import { useAccess } from "@/admin/app/providers/access/access";
import { groupKeys } from "./hooks/keys";
import { useDeleteGroups } from "./hooks/use-delete-groups";
import { useGroupsList } from "./hooks/use-groups-list";
import { getLastId } from "./group-id-utils";
import { GroupsModal } from "./groups-modal";
import { MoveDialog } from "./move-dialog";
import { useSubGroups } from "./sub-groups-context";

type GroupTableProps = {
    refresh: () => void;
};

export const GroupTable = ({ refresh: viewRefresh }: GroupTableProps) => {
    const { t } = useTranslation();
    const location = useLocation();
    const id = getLastId(location.pathname);
    const { currentGroup } = useSubGroups();
    const { hasAccess } = useAccess();
    const isManager = hasAccess("manage-users") || currentGroup()?.access?.manage;

    const queryClient = useQueryClient();
    const { data: groups = [] } = useGroupsList(id);
    const { mutateAsync: deleteGroupMutation } = useDeleteGroups();
    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: groupKeys.all });
        viewRefresh();
    };
    const [groupToDelete, setGroupToDelete] = useState<GroupRepresentation | undefined>();
    const [editGroup, setEditGroup] = useState<GroupRepresentation | undefined>();
    const [createOpen, setCreateOpen] = useState(false);
    const [duplicateId, setDuplicateId] = useState<string | undefined>();
    const [moveGroup, setMoveGroup] = useState<GroupRepresentation | undefined>();
    const [parentIdForCreate, setParentIdForCreate] = useState<string | undefined>();

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    const onDeleteConfirm = async () => {
        if (!groupToDelete?.id) return;
        try {
            await deleteGroupMutation([groupToDelete.id]);
            toast.success(t("groupDeleted", { count: 1 }));
            setGroupToDelete(undefined);
            refresh();
        } catch (error) {
            toast.error(t("groupDeleteError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const openCreate = (parentId?: string) => {
        setParentIdForCreate(parentId ?? id);
        setCreateOpen(true);
    };

    const filteredGroups = useMemo(() => {
        if (!search) return groups;
        const lower = search.toLowerCase();
        return groups.filter(g => g.name?.toLowerCase().includes(lower));
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

    const emptyMessageKey = id ? `noGroupsInThisSubGroup` : `noGroupsInThisRealm`;
    const colCount = isManager ? 2 : 1;

    return (
        <>
            <AlertDialog
                open={!!groupToDelete}
                onOpenChange={open => !open && setGroupToDelete(undefined)}
            >
                <AlertDialogContent className="max-w-lg sm:max-w-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("deleteConfirmTitle", { count: 1 })}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("deleteConfirmGroup", {
                                count: 1,
                                groupName: groupToDelete?.name
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-4">
                        <AlertDialogCancel className="h-9 min-h-9 w-full sm:w-auto">
                            {t("cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            data-testid="confirm"
                            className="h-9 min-h-9 w-full sm:w-auto"
                            onClick={onDeleteConfirm}
                        >
                            {t("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {editGroup && (
                <GroupsModal
                    open={true}
                    onOpenChange={open => !open && setEditGroup(undefined)}
                    id={editGroup.id}
                    rename={editGroup}
                    refresh={() => {
                        setEditGroup(undefined);
                        refresh();
                    }}
                    handleModalToggle={() => setEditGroup(undefined)}
                />
            )}

            {createOpen && (
                <GroupsModal
                    open={true}
                    onOpenChange={open => {
                        if (!open) setCreateOpen(false);
                    }}
                    id={parentIdForCreate ?? id}
                    handleModalToggle={() => setCreateOpen(false)}
                    refresh={() => {
                        setCreateOpen(false);
                        refresh();
                    }}
                />
            )}

            {duplicateId && (
                <GroupsModal
                    open={true}
                    onOpenChange={open => !open && setDuplicateId(undefined)}
                    id={duplicateId}
                    duplicateId={duplicateId}
                    refresh={() => {
                        setDuplicateId(undefined);
                        refresh();
                    }}
                    handleModalToggle={() => setDuplicateId(undefined)}
                />
            )}

            {moveGroup && (
                <MoveDialog
                    source={moveGroup}
                    refresh={() => {
                        setMoveGroup(undefined);
                        refresh();
                    }}
                    onClose={() => setMoveGroup(undefined)}
                />
            )}

            <div className="flex h-full w-full flex-col">
                <div className="flex items-center justify-between gap-2 py-2.5">
                    <FacetedFormFilter
                        type="text"
                        size="small"
                        title={t("search")}
                        value={search}
                        onChange={value => setSearch(value)}
                        placeholder={t("filterGroups")}
                    />
                    {isManager && (
                        <Button
                            type="button"
                            data-testid="createGroup"
                            variant="default"
                            size="sm"
                            aria-label={t("createGroup")}
                            onClick={() => openCreate()}
                        >
                            <Plus className="size-4" />
                            <span>{t("createGroup")}</span>
                        </Button>
                    )}
                </div>

                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[90%]">{t("groupName")}</TableHead>
                            {isManager && <TableHead className="w-[10%]" />}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedGroups.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={colCount}
                                    className="text-center text-muted-foreground"
                                >
                                    {t(emptyMessageKey)}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedGroups.map(group => (
                                <TableRow
                                    key={group.id}
                                    className={isManager ? "cursor-pointer" : undefined}
                                    onClick={() => isManager && setEditGroup(group)}
                                >
                                    <TableCell>
                                        <Link
                                            to={`${location.pathname}/${group.id}` as string}
                                            className="text-primary hover:underline"
                                        >
                                            {group.name}
                                        </Link>
                                    </TableCell>
                                    {isManager && (
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
                                                    <DropdownMenuItem
                                                        onClick={() => setEditGroup(group)}
                                                    >
                                                        <PencilSimple className="size-4" />
                                                        {t("edit")}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setMoveGroup(group)}
                                                    >
                                                        <ArrowsDownUp className="size-4" />
                                                        {t("moveTo")}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => openCreate(group.id)}
                                                    >
                                                        <Plus className="size-4" />
                                                        {t("createChildGroup")}
                                                    </DropdownMenuItem>
                                                    {!id && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setDuplicateId(group.id)
                                                            }
                                                        >
                                                            <CopySimple className="size-4" />
                                                            {t("duplicate")}
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() =>
                                                            setGroupToDelete(group)
                                                        }
                                                    >
                                                        <Trash className="size-4" />
                                                        {t("delete")}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    )}
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
