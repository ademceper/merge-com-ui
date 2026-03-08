import type AuthenticationFlowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticationFlowRepresentation";
import type { AuthenticationProviderRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigRepresentation";
import { Trans, useTranslation } from "@merge-rd/i18n";
import { Button, buttonVariants } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { Label } from "@merge-rd/ui/components/label";
import { Graph, Table as TableIconPhosphor } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Table, TableBody } from "@/admin/shared/ui/data-table";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import {
    type FlowParams,
    toAuthentication,
    toFlow
} from "../../shared/lib/routes/authentication";
import { useParams } from "../../shared/lib/use-params";
import { useToggle } from "../../shared/lib/use-toggle";
import { useConfirmDialog } from "../../shared/ui/confirm-dialog/confirm-dialog";
import { useAddExecutionToFlow } from "./hooks/use-add-execution-to-flow";
import { useAddFlowToFlow } from "./hooks/use-add-flow-to-flow";
import { useDeleteExecution } from "./hooks/use-delete-execution";
import { useDeleteFlow } from "./hooks/use-delete-flow";
import { useExecuteChange } from "./hooks/use-execute-change";
import { useFlowDetail } from "./hooks/use-flow-detail";
import { useUpdateExecution } from "./hooks/use-update-execution";
import { BindFlowDialog } from "./bind-flow-dialog";
import { BuildInLabel } from "./build-in-label";
import { AuthenticationProviderContextProvider } from "./components/authentication-provider-context";
import { FlowDiagram } from "./components/flow-diagram";
import { FlowHeader } from "./components/flow-header";
import { FlowRow } from "./components/flow-row";
import { AddStepModal } from "./components/modals/add-step-modal";
import { AddSubFlowModal, type Flow } from "./components/modals/add-sub-flow-modal";
import { DuplicateFlowModal } from "./duplicate-flow-modal";
import { EditFlowModal } from "./edit-flow-modal";
import { EmptyExecutionState } from "./empty-execution-state";
import type {
    ExecutionList,
    ExpandableExecution,
    IndexChange,
    LevelChange
} from "./execution-model";

export const providerConditionFilter = (value: AuthenticationProviderRepresentation) =>
    value.displayName?.startsWith("Condition ");

export function FlowDetails() {

    const { t } = useTranslation();
    const { realm } = useRealm();
    const { id, usedBy, builtIn } = useParams<FlowParams>();
    const navigate = useNavigate();

    const [tableView, setTableView] = useState(true);

    const [showAddExecutionDialog, setShowAddExecutionDialog] = useState<boolean>();
    const [showAddSubFlowDialog, setShowSubFlowDialog] = useState<boolean>();
    const [selectedExecution, setSelectedExecution] = useState<ExpandableExecution>();
    const [open, toggleOpen, setOpen] = useToggle();
    const [edit, setEdit] = useState(false);
    const [bindFlowOpen, toggleBindFlow] = useToggle();

    const { mutateAsync: executeChangeAsync } = useExecuteChange();
    const { mutateAsync: updateExecutionAsync } = useUpdateExecution();
    const { mutateAsync: addExecutionToFlowAsync } = useAddExecutionToFlow();
    const { mutateAsync: addFlowToFlowAsync } = useAddFlowToFlow();
    const { mutateAsync: deleteExecutionAsync } = useDeleteExecution();
    const { mutateAsync: deleteFlowAsync } = useDeleteFlow();

    const { data: flowDetailData, refetch: refetchFlowDetail } = useFlowDetail(id);
    const refresh = () => {
        refetchFlowDetail();
    };
    const flow = flowDetailData?.flow;
    const [executionList, setExecutionList] = useState<ExecutionList>();

    // Update executionList when query data changes
    useEffect(() => {
        if (flowDetailData?.executionList) {
            setExecutionList(flowDetailData.executionList);
        }
    }, [flowDetailData?.executionList]);

    const executeChange = async (
        ex: AuthenticationFlowRepresentation | ExpandableExecution,
        change: LevelChange | IndexChange
    ) => {
        try {
            await executeChangeAsync({
                ex,
                change,
                flowAlias: flow?.alias!
            });
            refresh();
            toast.success(t("updateFlowSuccess"));
        } catch (error: any) {
            toast.error(t("updateFlowError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const update = async (execution: ExpandableExecution) => {
        const { executionList, isCollapsed, ...ex } = execution;
        try {
            await updateExecutionAsync({
                flowAlias: flow?.alias!,
                execution: ex
            });
            refresh();
            toast.success(t("updateFlowSuccess"));
        } catch (error: any) {
            toast.error(t("updateFlowError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const addExecution = async (
        name: string,
        type: AuthenticationProviderRepresentation
    ) => {
        try {
            await addExecutionToFlowAsync({
                flow: name,
                provider: type.id!
            });
            refresh();
            toast.success(t("updateFlowSuccess"));
        } catch (error) {
            toast.error(t("updateFlowError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const addFlow = async (
        flowName: string,
        { name, description = "", type, provider }: Flow
    ) => {
        try {
            await addFlowToFlowAsync({
                flow: flowName,
                alias: name,
                description,
                provider,
                type
            });
            refresh();
            toast.success(t("updateFlowSuccess"));
        } catch (error) {
            toast.error(t("updateFlowError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: t("deleteConfirmExecution", {
            name: selectedExecution?.displayName
        }),
        children: (
            <Trans i18nKey="deleteConfirmExecutionMessage">
                {" "}
                <strong>{{ name: selectedExecution?.displayName }}</strong>.
            </Trans>
        ),
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await deleteExecutionAsync(selectedExecution?.id!);
                toast.success(t("deleteExecutionSuccess"));
                refresh();
            } catch (error) {
                toast.error(
                    t("deleteExecutionError", { error: getErrorMessage(error) }),
                    { description: getErrorDescription(error) }
                );
            }
        }
    });

    const [toggleDeleteFlow, DeleteFlowConfirm] = useConfirmDialog({
        titleKey: "deleteConfirmFlow",
        children: (
            <Trans i18nKey="deleteConfirmFlowMessage">
                {" "}
                <strong>{{ flow: flow?.alias || "" }}</strong>.
            </Trans>
        ),
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await deleteFlowAsync(flow!.id!);
                navigate({ to: toAuthentication({ realm }) as string });
                toast.success(t("deleteFlowSuccess"));
            } catch (error) {
                toast.error(t("deleteFlowError", { error: getErrorMessage(error) }), {
                    description: getErrorDescription(error)
                });
            }
        }
    });

    const hasExecutions = executionList?.expandableList.length !== 0;

    const dropdownItems = [
        ...(usedBy !== "DEFAULT"
            ? [
                  <DropdownMenuItem
                      data-testid="set-as-default"
                      key="default"
                      onClick={toggleBindFlow}
                  >
                      {t("bindFlow")}
                  </DropdownMenuItem>
              ]
            : []),
        <DropdownMenuItem key="duplicate" onClick={() => setOpen(true)}>
            {t("duplicate")}
        </DropdownMenuItem>,
        ...(!builtIn
            ? [
                  <DropdownMenuItem
                      data-testid="edit-flow"
                      key="edit"
                      onClick={() => setEdit(true)}
                  >
                      {t("editInfo")}
                  </DropdownMenuItem>
              ]
            : []),
        ...(!builtIn && !usedBy
            ? [
                  <DropdownMenuItem
                      data-testid="delete-flow"
                      key="delete"
                      onClick={() => toggleDeleteFlow()}
                  >
                      {t("delete")}
                  </DropdownMenuItem>
              ]
            : [])
    ];

    return (
        <AuthenticationProviderContextProvider>
            {bindFlowOpen && (
                <BindFlowDialog
                    flowAlias={flow?.alias!}
                    onClose={usedBy => {
                        toggleBindFlow();
                        navigate({
                            to: toFlow({
                                realm,
                                id: id!,
                                usedBy: usedBy ? "DEFAULT" : "notInUse",
                                builtIn: builtIn ? "builtIn" : undefined
                            }) as string
                        });
                    }}
                />
            )}
            {open && flow && (
                <DuplicateFlowModal
                    name={flow.alias!}
                    description={flow.description!}
                    toggleDialog={toggleOpen}
                    onComplete={() => {
                        refresh();
                        setOpen(false);
                    }}
                />
            )}
            {edit && (
                <EditFlowModal
                    flow={flow!}
                    toggleDialog={() => {
                        setEdit(!edit);
                        refresh();
                    }}
                />
            )}
            <DeleteFlowConfirm />

            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <Label>{t(`used.${usedBy}`)}</Label>
                    {builtIn && <BuildInLabel />}
                </div>
                <div className="flex items-center gap-2">
                    {dropdownItems.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                data-testid="action-dropdown"
                                className={buttonVariants()}
                            >
                                {t("action")}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {dropdownItems}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
            <div className="bg-muted/30 p-4">
                {executionList && hasExecutions && (
                    <>
                        <div
                            id="toolbar"
                            className="flex flex-wrap items-center gap-2 mb-4"
                        >
                            <div className="flex rounded-lg border p-0.5">
                                <Button
                                    type="button"
                                    variant={tableView ? "secondary" : "ghost"}
                                    size="sm"
                                    aria-label={t("tableView")}
                                    data-testid="tableView"
                                    onClick={() => setTableView(true)}
                                >
                                    <TableIconPhosphor className="size-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant={!tableView ? "secondary" : "ghost"}
                                    size="sm"
                                    aria-label={t("diagramView")}
                                    data-testid="diagramView"
                                    onClick={() => setTableView(false)}
                                >
                                    <Graph className="size-4" />
                                </Button>
                            </div>
                            <Button
                                data-testid="add-step"
                                variant="secondary"
                                onClick={() => setShowAddExecutionDialog(true)}
                            >
                                {t("addExecution")}
                            </Button>
                            <Button
                                data-testid="add-sub-flow"
                                variant="secondary"
                                onClick={() => setShowSubFlowDialog(true)}
                            >
                                {t("addSubFlow")}
                            </Button>
                        </div>
                        <DeleteConfirm />
                        {tableView && (
                            <Table aria-label={t("flows")} className="text-sm">
                                <FlowHeader />
                                {executionList.expandableList.map(execution => (
                                    <TableBody key={execution.id}>
                                        <FlowRow
                                            builtIn={!!builtIn}
                                            execution={execution}
                                            onRowClick={execution => {
                                                execution.isCollapsed =
                                                    !execution.isCollapsed;
                                                setExecutionList(executionList.clone());
                                            }}
                                            onRowChange={update}
                                            onAddExecution={(execution, type) =>
                                                addExecution(execution.displayName!, type)
                                            }
                                            onAddFlow={(execution, flow) =>
                                                addFlow(execution.displayName!, flow)
                                            }
                                            onDelete={execution => {
                                                setSelectedExecution(execution);
                                                toggleDeleteDialog();
                                            }}
                                        />
                                    </TableBody>
                                ))}
                            </Table>
                        )}
                        {flow && (
                            <>
                                {showAddExecutionDialog && (
                                    <AddStepModal
                                        name={flow.alias!}
                                        type={
                                            flow.providerId === "client-flow"
                                                ? "client"
                                                : "basic"
                                        }
                                        onSelect={async type => {
                                            if (type) {
                                                await addExecution(flow.alias!, type);
                                            }
                                            setShowAddExecutionDialog(false);
                                        }}
                                    />
                                )}
                                {showAddSubFlowDialog && (
                                    <AddSubFlowModal
                                        name={flow.alias!}
                                        onCancel={() => setShowSubFlowDialog(false)}
                                        onConfirm={async newFlow => {
                                            await addFlow(flow.alias!, newFlow);
                                            setShowSubFlowDialog(false);
                                        }}
                                    />
                                )}
                            </>
                        )}
                    </>
                )}
                {!tableView && executionList?.expandableList && (
                    <FlowDiagram executionList={executionList} />
                )}
                {!executionList?.expandableList ||
                    (flow && !hasExecutions && (
                        <EmptyExecutionState
                            flow={flow}
                            onAddExecution={type => addExecution(flow.alias!, type)}
                            onAddFlow={newFlow => addFlow(flow.alias!, newFlow)}
                        />
                    ))}
            </div>
        </AuthenticationProviderContextProvider>
    );
}
