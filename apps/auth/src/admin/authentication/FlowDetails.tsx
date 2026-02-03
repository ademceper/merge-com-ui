/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/authentication/FlowDetails.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import AuthenticationFlowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticationFlowRepresentation";
import type { AuthenticationProviderRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigRepresentation";
import AuthenticatorConfigRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigRepresentation";
import { AlertVariant, useAlerts, useFetch } from "../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Label } from "@merge/ui/components/label";
import {
    DropdownMenuItem,
} from "@merge/ui/components/dropdown-menu";
import {
    Table,
    TableBody,
} from "@merge/ui/components/table";
import { Graph, Table as TableIconPhosphor } from "@phosphor-icons/react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { useRealm } from "../context/realm-context/RealmContext";
import useToggle from "../utils/useToggle";
import { BindFlowDialog } from "./BindFlowDialog";
import { BuildInLabel } from "./BuildInLabel";
import { DuplicateFlowModal } from "./DuplicateFlowModal";
import { EditFlowModal } from "./EditFlowModal";
import { EmptyExecutionState } from "./EmptyExecutionState";
import { AuthenticationProviderContextProvider } from "./components/AuthenticationProviderContext";
import { FlowDiagram } from "./components/FlowDiagram";
import { FlowHeader } from "./components/FlowHeader";
import { FlowRow } from "./components/FlowRow";
import { AddStepModal } from "./components/modals/AddStepModal";
import { AddSubFlowModal, Flow } from "./components/modals/AddSubFlowModal";
import {
    ExecutionList,
    ExpandableExecution,
    IndexChange,
    LevelChange
} from "./execution-model";
import { toAuthentication } from "./routes/Authentication";
import { toFlow, type FlowParams } from "./routes/Flow";

export const providerConditionFilter = (value: AuthenticationProviderRepresentation) =>
    value.displayName?.startsWith("Condition ");

export default function FlowDetails() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { realm } = useRealm();
    const { addAlert, addError } = useAlerts();
    const { id, usedBy, builtIn } = useParams<FlowParams>();
    const navigate = useNavigate();
    const [key, setKey] = useState(0);
    const refresh = () => setKey(new Date().getTime());

    const [tableView, setTableView] = useState(true);
    const [flow, setFlow] = useState<AuthenticationFlowRepresentation>();
    const [executionList, setExecutionList] = useState<ExecutionList>();
    const [liveText, setLiveText] = useState("");

    const [showAddExecutionDialog, setShowAddExecutionDialog] = useState<boolean>();
    const [showAddSubFlowDialog, setShowSubFlowDialog] = useState<boolean>();
    const [selectedExecution, setSelectedExecution] = useState<ExpandableExecution>();
    const [open, toggleOpen, setOpen] = useToggle();
    const [edit, setEdit] = useState(false);
    const [bindFlowOpen, toggleBindFlow] = useToggle();

    useFetch(
        async () => {
            const flows = await adminClient.authenticationManagement.getFlows();
            const flow = flows.find(f => f.id === id);
            if (!flow) {
                throw new Error(t("notFound"));
            }

            const executions = await adminClient.authenticationManagement.getExecutions({
                flow: flow.alias!
            });
            return { flow, executions };
        },
        ({ flow, executions }) => {
            setFlow(flow);
            setExecutionList(new ExecutionList(executions));
        },
        [key]
    );

    const executeChange = async (
        ex: AuthenticationFlowRepresentation | ExpandableExecution,
        change: LevelChange | IndexChange
    ) => {
        try {
            let id = ex.id!;
            if ("parent" in change) {
                let config: AuthenticatorConfigRepresentation = {};
                if ("authenticationConfig" in ex) {
                    config = await adminClient.authenticationManagement.getConfig({
                        id: ex.authenticationConfig as string
                    });
                }

                try {
                    await adminClient.authenticationManagement.delExecution({ id });
                } catch {
                    // skipping already deleted execution
                }
                if ("authenticationFlow" in ex) {
                    const executionFlow = ex as ExpandableExecution;
                    const result =
                        await adminClient.authenticationManagement.addFlowToFlow({
                            flow: change.parent?.displayName! || flow?.alias!,
                            alias: executionFlow.displayName!,
                            description: executionFlow.description!,
                            provider: ex.providerId!,
                            type: "basic-flow"
                        });
                    id = result.id!;
                    ex.executionList?.forEach((e, i) =>
                        executeChange(e, {
                            parent: { ...ex, id: result.id },
                            newIndex: i,
                            oldIndex: i
                        })
                    );
                } else {
                    const result =
                        await adminClient.authenticationManagement.addExecutionToFlow({
                            flow: change.parent?.displayName! || flow?.alias!,
                            provider: ex.providerId!
                        });

                    if (config.id) {
                        const newConfig = {
                            id: result.id,
                            alias: config.alias,
                            config: config.config
                        };
                        await adminClient.authenticationManagement.createConfig(
                            newConfig
                        );
                    }

                    id = result.id!;
                }
            }
            const times = change.newIndex - change.oldIndex;
            for (let index = 0; index < Math.abs(times); index++) {
                if (times > 0) {
                    await adminClient.authenticationManagement.lowerPriorityExecution({
                        id
                    });
                } else {
                    await adminClient.authenticationManagement.raisePriorityExecution({
                        id
                    });
                }
            }
            refresh();
            addAlert(t("updateFlowSuccess"), AlertVariant.success);
        } catch (error: any) {
            addError("updateFlowError", error);
        }
    };

    const update = async (execution: ExpandableExecution) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { executionList, isCollapsed, ...ex } = execution;
        try {
            await adminClient.authenticationManagement.updateExecution(
                { flow: flow?.alias! },
                ex
            );
            refresh();
            addAlert(t("updateFlowSuccess"), AlertVariant.success);
        } catch (error: any) {
            addError("updateFlowError", error);
        }
    };

    const addExecution = async (
        name: string,
        type: AuthenticationProviderRepresentation
    ) => {
        try {
            await adminClient.authenticationManagement.addExecutionToFlow({
                flow: name,
                provider: type.id!
            });
            refresh();
            addAlert(t("updateFlowSuccess"), AlertVariant.success);
        } catch (error) {
            addError("updateFlowError", error);
        }
    };

    const addFlow = async (
        flow: string,
        { name, description = "", type, provider }: Flow
    ) => {
        try {
            await adminClient.authenticationManagement.addFlowToFlow({
                flow,
                alias: name,
                description,
                provider,
                type
            });
            refresh();
            addAlert(t("updateFlowSuccess"), AlertVariant.success);
        } catch (error) {
            addError("updateFlowError", error);
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
                await adminClient.authenticationManagement.delExecution({
                    id: selectedExecution?.id!
                });
                addAlert(t("deleteExecutionSuccess"), AlertVariant.success);
                refresh();
            } catch (error) {
                addError("deleteExecutionError", error);
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
                await adminClient.authenticationManagement.deleteFlow({
                    flowId: flow!.id!
                });
                navigate(toAuthentication({ realm }));
                addAlert(t("deleteFlowSuccess"), AlertVariant.success);
            } catch (error) {
                addError("deleteFlowError", error);
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
                        navigate(
                            toFlow({
                                realm,
                                id: id!,
                                usedBy: usedBy ? "DEFAULT" : "notInUse",
                                builtIn: builtIn ? "builtIn" : undefined
                            })
                        );
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

            <ViewHeader
                titleKey={flow?.alias || ""}
                badges={[
                    { text: <Label>{t(`used.${usedBy}`)}</Label> },
                    builtIn
                        ? {
                              text: <BuildInLabel />,
                              id: "builtIn"
                          }
                        : {}
                ]}
                dropdownItems={dropdownItems}
            />
            <div className="bg-muted/30 p-4">
                {executionList && hasExecutions && (
                    <>
                        <div id="toolbar" className="flex flex-wrap items-center gap-2 mb-4">
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
                            <Table
                                aria-label={t("flows")}
                                className="text-sm"
                            >
                                <FlowHeader />
                                <>
                                    {executionList.expandableList.map(
                                        execution => (
                                            <TableBody key={execution.id}>
                                                <FlowRow
                                                    builtIn={!!builtIn}
                                                    execution={execution}
                                                    onRowClick={execution => {
                                                        execution.isCollapsed =
                                                            !execution.isCollapsed;
                                                        setExecutionList(
                                                            executionList.clone()
                                                        );
                                                    }}
                                                    onRowChange={update}
                                                    onAddExecution={(
                                                        execution,
                                                        type
                                                    ) =>
                                                        addExecution(
                                                            execution.displayName!,
                                                            type
                                                        )
                                                    }
                                                    onAddFlow={(
                                                        execution,
                                                        flow
                                                    ) =>
                                                        addFlow(
                                                            execution.displayName!,
                                                            flow
                                                        )
                                                    }
                                                    onDelete={execution => {
                                                        setSelectedExecution(
                                                            execution
                                                        );
                                                        toggleDeleteDialog();
                                                    }}
                                                />
                                            </TableBody>
                                        )
                                    )}
                                </>
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
                        <div className="sr-only" aria-live="assertive">
                            {liveText}
                        </div>
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
