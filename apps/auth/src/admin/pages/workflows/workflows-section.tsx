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
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge-rd/ui/components/empty";
import { Label } from "@merge-rd/ui/components/label";
import { Switch } from "@merge-rd/ui/components/switch";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
    type ColumnDef,
    DataTable,
    DataTableRowActions
} from "@/admin/shared/ui/data-table";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { toWorkflowDetail } from "../../shared/lib/routes/workflows";
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

    const columns: ColumnDef<WorkflowRepresentation>[] = [
        {
            accessorKey: "name",
            header: t("name"),
            cell: ({ row }) => (
                <Link
                    to={
                        toWorkflowDetail({
                            realm,
                            mode: "update",
                            id: row.original.id!
                        }) as string
                    }
                    className="text-primary hover:underline"
                >
                    {row.original.name}
                </Link>
            )
        },
        { accessorKey: "id", header: t("id") },
        {
            accessorKey: "status",
            header: t("status"),
            cell: ({ row }) => (
                <Label className="flex items-center gap-2 cursor-pointer">
                    <Switch
                        data-testid={`toggle-enabled-${row.original.name}`}
                        checked={row.original.enabled ?? true}
                        onCheckedChange={() => toggleEnabled(row.original)}
                    />
                    <span>{row.original.enabled ? t("enabled") : t("disabled")}</span>
                </Label>
            )
        },
        {
            id: "actions",
            header: "",
            size: 50,
            enableHiding: false,
            cell: ({ row }) => (
                <DataTableRowActions row={row}>
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                        onClick={() => setWorkflowToDelete(row.original)}
                    >
                        {t("delete")}
                    </button>
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                        onClick={() =>
                            navigate({
                                to: toWorkflowDetail({
                                    realm,
                                    mode: "copy",
                                    id: row.original.id!
                                }) as string
                            })
                        }
                    >
                        {t("copy")}
                    </button>
                </DataTableRowActions>
            )
        }
    ];

    const emptyContent = (
        <Empty className="py-12">
            <EmptyHeader>
                <EmptyTitle>{t("emptyWorkflows")}</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
                <EmptyDescription>{t("emptyWorkflowsInstructions")}</EmptyDescription>
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
    );

    return (
        <div className="bg-muted/30 p-0">
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
            <DataTable<WorkflowRepresentation>
                columns={columns}
                data={workflows}
                searchColumnId="name"
                searchPlaceholder={t("search")}
                emptyContent={emptyContent}
                emptyMessage={t("emptyWorkflows")}
                toolbar={
                    <Button asChild data-testid="create-workflow">
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
                }
            />
        </div>
    );
}
