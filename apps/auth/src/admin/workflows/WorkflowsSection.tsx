import { Button } from "@merge/ui/components/button";
import { Label } from "@merge/ui/components/label";
import { Switch } from "@merge/ui/components/switch";
import { getErrorDescription, getErrorMessage, useFetch } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import WorkflowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/workflowRepresentation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { useRealm } from "../context/realm-context/RealmContext";
import helpUrls from "../help-urls";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@merge/ui/components/alert-dialog";
import {
    DataTable,
    DataTableRowActions,
    type ColumnDef
} from "@merge/ui/components/table";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge/ui/components/empty";
import { toWorkflowDetail } from "./routes/WorkflowDetail";

export default function WorkflowsSection() {
    const { adminClient } = useAdminClient();
    const { realm } = useRealm();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [key, setKey] = useState(0);
    const refresh = () => setKey(k => k + 1);
    const [workflowToDelete, setWorkflowToDelete] = useState<WorkflowRepresentation>();
    const [workflows, setWorkflows] = useState<WorkflowRepresentation[]>([]);

    useFetch(
        async () => {
            const list = await adminClient.workflows.find();
            return list.sort((a: WorkflowRepresentation, b: WorkflowRepresentation) => (a.name ?? "").localeCompare(b.name ?? ""));
        },
        setWorkflows,
        [key]
    );

    const toggleEnabled = async (workflow: WorkflowRepresentation) => {
        const enabled = !(workflow.enabled ?? true);
        try {
            await adminClient.workflows.update({ id: workflow.id! }, { ...workflow, enabled });
            toast.success(enabled ? t("workflowEnabled") : t("workflowDisabled"));
            refresh();
        } catch (error) {
            toast.error(t("workflowUpdateError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const onDeleteConfirm = async () => {
        if (!workflowToDelete?.id) return;
        try {
            await adminClient.workflows.delById({ id: workflowToDelete.id });
            setWorkflowToDelete(undefined);
            toast.success(t("workflowDeletedSuccess"));
            refresh();
        } catch (error) {
            toast.error(t("workflowDeleteError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const columns: ColumnDef<WorkflowRepresentation>[] = [
        {
            accessorKey: "name",
            header: t("name"),
            cell: ({ row }) => (
                <Link to={toWorkflowDetail({ realm, mode: "update", id: row.original.id! })} className="text-primary hover:underline">
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
                        onClick={() => navigate(toWorkflowDetail({ realm, mode: "copy", id: row.original.id! }))}
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
                <Button variant="default" onClick={() => navigate(toWorkflowDetail({ realm, mode: "create", id: "new" }))}>
                    {t("createWorkflow")}
                </Button>
            </EmptyContent>
        </Empty>
    );

    return (
        <>
            <ViewHeader titleKey="titleWorkflows" subKey="workflowsExplain" helpUrl={helpUrls.workflowsUrl} />
            <div className="bg-muted/30 p-0">
                <AlertDialog open={!!workflowToDelete} onOpenChange={(open) => !open && setWorkflowToDelete(undefined)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t("workflowDeleteConfirm")}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {t("workflowDeleteConfirmDialog", { selectedRoleName: workflowToDelete?.name ?? "" })}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                            <AlertDialogAction variant="destructive" data-testid="confirm" onClick={onDeleteConfirm}>
                                {t("delete")}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <DataTable<WorkflowRepresentation>
                    key={key}
                    columns={columns}
                    data={workflows}
                    searchColumnId="name"
                    searchPlaceholder={t("search")}
                    emptyContent={emptyContent}
                    emptyMessage={t("emptyWorkflows")}
                    toolbar={
                        <Button asChild data-testid="create-workflow">
                            <Link to={toWorkflowDetail({ realm, mode: "create", id: "new" })}>
                                {t("createWorkflow")}
                            </Link>
                        </Button>
                    }
                />
            </div>
        </>
    );
}
