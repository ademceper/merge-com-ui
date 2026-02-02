/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/advanced/ClusteringPanel.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { AlertVariant } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@merge/ui/components/collapsible";
import { Label } from "@merge/ui/components/label";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HelpItem } from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../admin-client";
import { useAlerts } from "../../../shared/keycloak-ui-shared";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { FormAccess } from "../../components/form/FormAccess";
import { ListEmptyState } from "../../../shared/keycloak-ui-shared";
import { Action, KeycloakDataTable } from "../../../shared/keycloak-ui-shared";
import { TimeSelectorForm } from "../../components/time-selector/TimeSelectorForm";
import useFormatDate, { FORMAT_DATE_AND_TIME } from "../../utils/useFormatDate";
import { AddHostDialog } from ".././advanced/AddHostDialog";
import { AdvancedProps, parseResult } from "../AdvancedTab";

type Node = {
    host: string;
    registration: string;
};

export const ClusteringPanel = ({
    save,
    client: { id, registeredNodes, access }
}: AdvancedProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { addAlert, addError } = useAlerts();
    const formatDate = useFormatDate();

    const [nodes, setNodes] = useState(registeredNodes || {});
    const [expanded, setExpanded] = useState(false);
    const [selectedNode, setSelectedNode] = useState("");
    const [addNodeOpen, setAddNodeOpen] = useState(false);
    const [key, setKey] = useState(0);
    const refresh = () => setKey(new Date().getTime());

    const testCluster = async () => {
        const result = await adminClient.clients.testNodesAvailable({ id: id! });
        parseResult(result, "testCluster", addAlert, t);
    };

    const [toggleDeleteNodeConfirm, DeleteNodeConfirm] = useConfirmDialog({
        titleKey: "deleteNode",
        messageKey: t("deleteNodeBody", {
            node: selectedNode
        }),
        continueButtonLabel: "delete",
        continueButtonVariant: "danger",
        onConfirm: async () => {
            try {
                await adminClient.clients.deleteClusterNode({
                    id: id!,
                    node: selectedNode
                });
                setNodes({
                    ...Object.keys(nodes).reduce((object: any, key) => {
                        if (key !== selectedNode) {
                            object[key] = nodes[key];
                        }
                        return object;
                    }, {})
                });
                refresh();
                addAlert(t("deleteNodeSuccess"), AlertVariant.success);
            } catch (error) {
                addError("deleteNodeFail", error);
            }
        }
    });

    return (
        <>
            <FormAccess
                role="manage-clients"
                fineGrainedAccess={access?.configure}
                isHorizontal
            >
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="kc-node-reregistration-timeout">{t("nodeReRegistrationTimeout")}</Label>
                        <HelpItem
                            helpText={t("nodeReRegistrationTimeoutHelp")}
                            fieldLabelId="nodeReRegistrationTimeout"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div>
                            <TimeSelectorForm name="nodeReRegistrationTimeout" />
                        </div>
                        <div>
                            <Button
                                variant="secondary"
                                onClick={() => save()}
                            >
                                {t("save")}
                            </Button>
                        </div>
                    </div>
                </div>
            </FormAccess>
            <>
                <DeleteNodeConfirm />
                <AddHostDialog
                    clientId={id!}
                    isOpen={addNodeOpen}
                    onAdded={node => {
                        nodes[node] = Date.now() / 1000;
                        refresh();
                    }}
                    onClose={() => setAddNodeOpen(false)}
                />
                <Collapsible open={expanded} onOpenChange={setExpanded}>
                    <CollapsibleTrigger className="font-medium">
                        {t("registeredClusterNodes")}
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                    <KeycloakDataTable
                        key={key}
                        ariaLabelKey="registeredClusterNodes"
                        loader={() =>
                            Promise.resolve<Node[]>(
                                Object.entries(nodes || {}).map(entry => {
                                    return { host: entry[0], registration: entry[1] };
                                })
                            )
                        }
                        toolbarItem={
                            <>
                                <div>
                                    <Button
                                        id="testClusterAvailability"
                                        data-testid="test-cluster-availability"
                                        onClick={testCluster}
                                        variant="secondary"
                                        disabled={Object.keys(nodes).length === 0}
                                    >
                                        {t("testClusterAvailability")}
                                    </Button>
                                </div>
                                <div>
                                    <Button
                                        id="registerNodeManually"
                                        data-testid="registerNodeManually"
                                        onClick={() => setAddNodeOpen(true)}
                                        variant="outline"
                                    >
                                        {t("registerNodeManually")}
                                    </Button>
                                </div>
                            </>
                        }
                        actions={[
                            {
                                title: t("delete"),
                                onRowClick: node => {
                                    setSelectedNode(node.host);
                                    toggleDeleteNodeConfirm();
                                }
                            } as Action<Node>
                        ]}
                        columns={[
                            {
                                name: "host",
                                displayKey: "nodeHost"
                            },
                            {
                                name: "registration",
                                displayKey: "lastRegistration",
                                cellFormatters: [
                                    value =>
                                        value
                                            ? formatDate(
                                                  new Date(
                                                      parseInt(value.toString()) * 1000
                                                  ),
                                                  FORMAT_DATE_AND_TIME
                                              )
                                            : ""
                                ]
                            }
                        ]}
                        emptyState={
                            <ListEmptyState
                                message={t("noNodes")}
                                instructions={t("noNodesInstructions")}
                                primaryActionText={t("registerNodeManually")}
                                onPrimaryAction={() => setAddNodeOpen(true)}
                            />
                        }
                    />
                    </CollapsibleContent>
                </Collapsible>
            </>
        </>
    );
};
