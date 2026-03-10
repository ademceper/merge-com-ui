import type WorkflowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/workflowRepresentation";
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
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge-rd/ui/components/empty";
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import { Label } from "@merge-rd/ui/components/label";
import { Switch } from "@merge-rd/ui/components/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TablePaginationFooter,
    TableRow,
    type TableSortDirection
} from "@merge-rd/ui/components/table";
import { Copy, DotsThree, Trash } from "@phosphor-icons/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getErrorDescription, getErrorMessage } from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { toWorkflowDetail } from "@/admin/shared/lib/routes/workflows";
import { useDeleteWorkflow } from "./hooks/use-delete-workflow";
import { useUpdateWorkflow } from "./hooks/use-update-workflow";
import { useWorkflows as useWorkflowsQuery } from "./hooks/use-workflows";

export function WorkflowsSection() {
    const { realm } = useRealm();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data: workflows = [], refetch: refreshWorkflows } = useWorkflowsQuery();
    const refresh = () => refreshWorkflows();
    const [workflowToDelete, setWorkflowToDelete] = useState<WorkflowRepresentation>();
    const { mutateAsync: updateWorkflow } = useUpdateWorkflow();
    const { mutateAsync: deleteWorkflow } = useDeleteWorkflow();

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [sortBy, setSortBy] = useState<"name" | null>(null);
    const [sortDirection, setSortDirection] = useState<TableSortDirection>(false);

    const toggleSort = (column: "name") => {
        if (sortBy === column) {
            setSortDirection(prev =>
                prev === "asc" ? "desc" : prev === "desc" ? false : "asc"
            );
            if (sortDirection === "desc") setSortBy(null);
        } else {
            setSortBy(column);
            setSortDirection("asc");
        }
    };

    const filteredWorkflows = useMemo(() => {
        let result = workflows;
        if (search) {
            const lower = search.toLowerCase();
            result = result.filter((w: WorkflowRepresentation) => w.name?.toLowerCase().includes(lower));
        }
        if (sortBy && sortDirection) {
            const dir = sortDirection === "asc" ? 1 : -1;
            result = [...result].sort((a, b) => {
                const aVal = (a[sortBy] ?? "").toLowerCase();
                const bVal = (b[sortBy] ?? "").toLowerCase();
                return aVal < bVal ? -dir : aVal > bVal ? dir : 0;
            });
        }
        return result;
    }, [workflows, search, sortBy, sortDirection]);

    const totalCount = filteredWorkflows.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedWorkflows = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredWorkflows.slice(start, start + pageSize);
    }, [filteredWorkflows, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const toggleEnabled = async (workflow: WorkflowRepresentation) => {
        const enabled = !(workflow.enabled ?? true);
        try {
            await updateWorkflow({
                id: workflow.id!,
                workflow: { ...workflow, enabled }
            });
            toast.success(enabled ? t("workflowEnabled") : t("workflowDisabled"));
            refresh();
        } catch (error) {
            toast.error(t("workflowUpdateError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const onDeleteConfirm = async () => {
        if (!workflowToDelete?.id) return;
        try {
            await deleteWorkflow(workflowToDelete.id);
            setWorkflowToDelete(undefined);
            toast.success(t("workflowDeletedSuccess"));
            refresh();
        } catch (error) {
            toast.error(t("workflowDeleteError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    if (workflows.length === 0 && !search) {
        return (
            <div className="flex h-full w-full flex-col">
                <Empty className="py-12">
                    <EmptyHeader>
                        <EmptyTitle>{t("emptyWorkflows")}</EmptyTitle>
                    </EmptyHeader>
                    <EmptyContent>
                        <EmptyDescription>
                            {t("emptyWorkflowsInstructions")}
                        </EmptyDescription>
                        <Button
                            variant="default"
                            onClick={() =>
                                navigate({
                                    to: toWorkflowDetail({
                                        realm,
                                        mode: "create",
                                        id: "new"
                                    }) as string
                                })
                            }
                        >
                            {t("createWorkflow")}
                        </Button>
                    </EmptyContent>
                </Empty>
            </div>
        );
    }

    return (
        <>
            <AlertDialog
                open={!!workflowToDelete}
                onOpenChange={open => !open && setWorkflowToDelete(undefined)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("workflowDeleteConfirm")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("workflowDeleteConfirmDialog", {
                                selectedRoleName: workflowToDelete?.name ?? ""
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            data-testid="confirm"
                            onClick={onDeleteConfirm}
                        >
                            {t("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="flex h-full w-full flex-col">
                <div className="flex items-center justify-between gap-2 py-2.5">
                    <FacetedFormFilter
                        type="text"
                        size="small"
                        title={t("search")}
                        value={search}
                        onChange={value => setSearch(value)}
                        placeholder={t("search")}
                    />
                    <Button asChild data-testid="create-workflow" size="sm">
                        <Link
                            to={
                                toWorkflowDetail({
                                    realm,
                                    mode: "create",
                                    id: "new"
                                }) as string
                            }
                        >
                            {t("createWorkflow")}
                        </Link>
                    </Button>
                </div>

                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead
                                className="w-[30%]"
                                sortable
                                sortDirection={sortBy === "name" ? sortDirection : false}
                                onSort={() => toggleSort("name")}
                            >
                                {t("name")}
                            </TableHead>
                            <TableHead className="w-[30%]">{t("id")}</TableHead>
                            <TableHead className="w-[25%]">{t("status")}</TableHead>
                            <TableHead className="w-[15%]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedWorkflows.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="text-center text-muted-foreground"
                                >
                                    {t("emptyWorkflows")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedWorkflows.map((workflow: WorkflowRepresentation) => (
                                <TableRow
                                    key={workflow.id}
                                    className="cursor-pointer"
                                    onClick={() =>
                                        navigate({
                                            to: toWorkflowDetail({
                                                realm,
                                                mode: "update",
                                                id: workflow.id!
                                            }) as string
                                        })
                                    }
                                >
                                    <TableCell className="truncate">
                                        <Link
                                            to={
                                                toWorkflowDetail({
                                                    realm,
                                                    mode: "update",
                                                    id: workflow.id!
                                                }) as string
                                            }
                                            className="text-primary hover:underline"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            {workflow.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {workflow.id}
                                    </TableCell>
                                    <TableCell onClick={e => e.stopPropagation()}>
                                        <Label className="flex items-center gap-2 cursor-pointer">
                                            <Switch
                                                data-testid={`toggle-enabled-${workflow.name}`}
                                                checked={workflow.enabled ?? true}
                                                onCheckedChange={() =>
                                                    toggleEnabled(workflow)
                                                }
                                            />
                                            <span>
                                                {workflow.enabled
                                                    ? t("enabled")
                                                    : t("disabled")}
                                            </span>
                                        </Label>
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
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        navigate({
                                                            to: toWorkflowDetail({
                                                                realm,
                                                                mode: "copy",
                                                                id: workflow.id!
                                                            }) as string
                                                        })
                                                    }
                                                >
                                                    <Copy className="size-4" />
                                                    {t("copy")}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() =>
                                                        setWorkflowToDelete(workflow)
                                                    }
                                                >
                                                    <Trash className="size-4" />
                                                    {t("delete")}
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
                            <TableCell colSpan={4} className="p-0">
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
}
