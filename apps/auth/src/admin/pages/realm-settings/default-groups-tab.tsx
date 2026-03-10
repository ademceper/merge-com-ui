import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { Trans, useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
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
import { DotsThree, Plus, Question, Trash } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner,
    useHelp
} from "@/shared/keycloak-ui-shared";
import { useAccess } from "@/admin/app/providers/access/access";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { toUserFederation } from "@/admin/shared/lib/routes/user-federation";
import { useToggle } from "@/admin/shared/lib/use-toggle";
import { useConfirmDialog } from "@/admin/shared/ui/confirm-dialog/confirm-dialog";
import { GroupPickerDialog } from "@/admin/shared/ui/group/group-picker-dialog";
import { useAddDefaultGroup } from "./hooks/use-add-default-group";
import { useDefaultGroups } from "./hooks/use-default-groups";
import { useRemoveDefaultGroup } from "./hooks/use-remove-default-group";

export const DefaultGroupsTab = () => {
    const { t } = useTranslation();
    const [isGroupPickerOpen, toggleGroupPicker] = useToggle();
    const [selectedRows, setSelectedRows] = useState<GroupRepresentation[]>([]);
    const { realm } = useRealm();
    const { enabled } = useHelp();
    const { hasAccess } = useAccess();
    const canAddOrRemoveGroups = hasAccess("view-users", "manage-realm");

    const { data: defaultGroups } = useDefaultGroups();
    const addDefaultGroupMutation = useAddDefaultGroup();
    const removeDefaultGroupMutation = useRemoveDefaultGroup();

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const filteredData = useMemo(() => {
        if (!defaultGroups) return [];
        if (!search) return defaultGroups;
        const lower = search.toLowerCase();
        return defaultGroups.filter(g => g.name?.toLowerCase().includes(lower));
    }, [defaultGroups, search]);

    const totalCount = filteredData.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedData = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage, pageSize]);

    const removeGroups = async (groups: GroupRepresentation[]) => {
        try {
            await removeDefaultGroupMutation.mutateAsync(groups);
            toast.success(t("groupRemove", { count: groups.length }));
        } catch (error) {
            toast.error(t("groupRemoveError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const addGroups = async (groups: GroupRepresentation[]) => {
        try {
            await addDefaultGroupMutation.mutateAsync(groups);
            toast.success(t("defaultGroupAdded", { count: groups.length }));
        } catch (error) {
            toast.error(t("defaultGroupAddedError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const [toggleRemoveDialog, RemoveDialog] = useConfirmDialog({
        titleKey: t("removeConfirmTitle", { count: selectedRows.length }),
        messageKey: t("removeConfirm", { count: selectedRows.length }),
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            await removeGroups(selectedRows);
            setSelectedRows([]);
        }
    });

    if (!defaultGroups) {
        return <KeycloakSpinner />;
    }

    return (
        <>
            <RemoveDialog />
            {isGroupPickerOpen && (
                <GroupPickerDialog
                    type="selectMany"
                    text={{
                        title: "addDefaultGroups",
                        ok: "add"
                    }}
                    onConfirm={async groups => {
                        await addGroups(groups || []);
                        toggleGroupPicker();
                    }}
                    onClose={toggleGroupPicker}
                />
            )}
            <div className="space-y-4">
                {enabled && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <p className="cursor-pointer text-sm text-muted-foreground">
                                <Question className="mr-1 inline size-4" />{" "}
                                {t("whatIsDefaultGroups")}
                            </p>
                        </PopoverTrigger>
                        <PopoverContent>
                            <Trans i18nKey="defaultGroupsHelp">
                                {" "}
                                <Link to={toUserFederation({ realm }) as string} />.
                            </Trans>
                        </PopoverContent>
                    </Popover>
                )}
                <div className="flex h-full w-full flex-col">
                    <div className="flex items-center justify-between gap-2 py-2.5">
                        <FacetedFormFilter
                            type="text"
                            size="small"
                            title={t("search")}
                            value={search}
                            onChange={value => setSearch(value)}
                            placeholder={t("searchForGroups")}
                        />
                        {canAddOrRemoveGroups && (
                            <Button
                                data-testid="openCreateGroupModal"
                                variant="default"
                                className="flex h-9 w-9 shrink-0 items-center justify-center p-0 sm:h-9 sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
                                onClick={toggleGroupPicker}
                            >
                                <Plus size={20} className="shrink-0 sm:hidden" />
                                <span className="hidden sm:inline">{t("addGroups")}</span>
                            </Button>
                        )}
                    </div>

                    <Table className="table-fixed">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40%]">{t("groupName")}</TableHead>
                                <TableHead className="w-[50%]">{t("path")}</TableHead>
                                {canAddOrRemoveGroups && (
                                    <TableHead className="w-[10%]" />
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={canAddOrRemoveGroups ? 3 : 2}
                                        className="text-center text-muted-foreground"
                                    >
                                        {t("noDefaultGroups")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map(group => (
                                    <TableRow key={group.id}>
                                        <TableCell className="truncate">
                                            {group.name ?? "-"}
                                        </TableCell>
                                        <TableCell className="truncate">
                                            {group.path ?? "-"}
                                        </TableCell>
                                        {canAddOrRemoveGroups && (
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
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => {
                                                                setSelectedRows([group]);
                                                                toggleRemoveDialog();
                                                            }}
                                                        >
                                                            <Trash className="size-4" />
                                                            {t("remove")}
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
                                <TableCell colSpan={canAddOrRemoveGroups ? 3 : 2} className="p-0">
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
            </div>
        </>
    );
};
