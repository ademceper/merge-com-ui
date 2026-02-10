import { Button } from "@merge/ui/components/button";
import { Label } from "@merge/ui/components/label";
import { Switch } from "@merge/ui/components/switch";
import { getErrorDescription, getErrorMessage, Action,
    KeycloakDataTable,
    ListEmptyState } from "../../shared/keycloak-ui-shared";
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
import { toWorkflowDetail } from "./routes/WorkflowDetail";

export default function WorkflowsSection() {
    const { adminClient } = useAdminClient();

    const { realm } = useRealm();
    const { t } = useTranslation();
    const navigate = useNavigate();
const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);

    const [workflowToDelete, setWorkflowToDelete] = useState<WorkflowRepresentation>();

    const loader = async () => {
        const workflows = await adminClient.workflows.find();
        return workflows.sort((a: WorkflowRepresentation, b: WorkflowRepresentation) => {
            const nameA = a.name ?? "";
            const nameB = b.name ?? "";
            return nameA.localeCompare(nameB);
        });
    };

    const toggleEnabled = async (workflow: WorkflowRepresentation) => {
        const enabled = !(workflow.enabled ?? true);
        const workflowToUpdate = { ...workflow, enabled };
        try {
            await adminClient.workflows.update({ id: workflow.id! }, workflowToUpdate);

            toast.success(
                workflowToUpdate.enabled ? t("workflowEnabled") : t("workflowDisabled")
            );
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

    return (
        <>
            <ViewHeader
                titleKey="titleWorkflows"
                subKey="workflowsExplain"
                helpUrl={helpUrls.workflowsUrl}
            />
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
                <KeycloakDataTable
                    key={key}
                    toolbarItem={
                        <Button asChild data-testid="create-workflow">
                            <Link
                                to={toWorkflowDetail({
                                    realm,
                                    mode: "create",
                                    id: "new"
                                })}
                            >
                                {t("createWorkflow")}
                            </Link>
                        </Button>
                    }
                    columns={[
                        {
                            name: "name",
                            displayKey: "name",
                            cellRenderer: (row: WorkflowRepresentation) => (
                                <Link
                                    to={toWorkflowDetail({
                                        realm,
                                        mode: "update",
                                        id: row.id!
                                    })}
                                >
                                    {row.name}
                                </Link>
                            )
                        },
                        {
                            name: "id",
                            displayKey: "id"
                        },
                        {
                            name: "status",
                            displayKey: "status",
                            cellRenderer: (workflow: WorkflowRepresentation) => (
                                <Label className="flex items-center gap-2 cursor-pointer">
                                    <Switch
                                        data-testid={`toggle-enabled-${workflow.name}`}
                                        checked={workflow.enabled ?? true}
                                        onCheckedChange={() => toggleEnabled(workflow)}
                                    />
                                    <span>{workflow.enabled ? t("enabled") : t("disabled")}</span>
                                </Label>
                            )
                        }
                    ]}
                    actions={[
                        {
                            title: t("delete"),
                            onRowClick: workflow => setWorkflowToDelete(workflow)
                        } as Action<WorkflowRepresentation>,
                        {
                            title: t("copy"),
                            onRowClick: workflow => {
                                navigate(
                                    toWorkflowDetail({
                                        realm,
                                        mode: "copy",
                                        id: workflow.id!
                                    })
                                );
                            }
                        } as Action<WorkflowRepresentation>
                    ]}
                    loader={loader}
                    ariaLabelKey="workflows"
                    emptyState={
                        <ListEmptyState
                            message={t("emptyWorkflows")}
                            instructions={t("emptyWorkflowsInstructions")}
                            primaryActionText={t("createWorkflow")}
                            onPrimaryAction={() =>
                                navigate(
                                    toWorkflowDetail({ realm, mode: "create", id: "new" })
                                )
                            }
                        />
                    }
                />
            </div>
        </>
    );
}
