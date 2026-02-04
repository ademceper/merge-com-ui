import { Button } from "@merge/ui/components/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@merge/ui/components/collapsible";
import { Label } from "@merge/ui/components/label";
import {
    DataTable,
    DataTableRowActions,
    type ColumnDef
} from "@merge/ui/components/table";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { HelpItem } from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../admin-client";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { FormAccess } from "../../components/form/FormAccess";
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
const formatDate = useFormatDate();

    const [nodes, setNodes] = useState(registeredNodes || {});
    const [expanded, setExpanded] = useState(false);
    const [selectedNode, setSelectedNode] = useState("");
    const [addNodeOpen, setAddNodeOpen] = useState(false);
    const [key, setKey] = useState(0);
    const refresh = () => setKey(new Date().getTime());

    const nodeData = useMemo(() =>
        Object.entries(nodes || {}).map(entry => ({
            host: entry[0],
            registration: entry[1]
        })),
        [nodes]
    );

    const testCluster = async () => {
        const result = await adminClient.clients.testNodesAvailable({ id: id! });
        parseResult(result, "testCluster", t);
    };

    const [toggleDeleteNodeConfirm, DeleteNodeConfirm] = useConfirmDialog({
        titleKey: "deleteNode",
        messageKey: t("deleteNodeBody", {
            node: selectedNode
        }),
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
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
                toast.success(t("deleteNodeSuccess"));
            } catch (error) {
                toast.error(t("deleteNodeFail", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        }
    });

    const columns: ColumnDef<Node>[] = [
        {
            accessorKey: "host",
            header: t("nodeHost"),
            cell: ({ row }) => row.original.host
        },
        {
            accessorKey: "registration",
            header: t("lastRegistration"),
            cell: ({ row }) =>
                row.original.registration
                    ? formatDate(
                          new Date(parseInt(row.original.registration.toString()) * 1000),
                          FORMAT_DATE_AND_TIME
                      )
                    : ""
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
                        className="w-full rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => {
                            setSelectedNode(row.original.host);
                            toggleDeleteNodeConfirm();
                        }}
                    >
                        {t("delete")}
                    </button>
                </DataTableRowActions>
            )
        }
    ];

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
                        <DataTable
                            key={key}
                            columns={columns}
                            data={nodeData}
                            searchColumnId="host"
                            searchPlaceholder={t("searchByHost")}
                            emptyMessage={t("noNodes")}
                            toolbar={
                                <div className="flex gap-2">
                                    <Button
                                        id="testClusterAvailability"
                                        data-testid="test-cluster-availability"
                                        onClick={testCluster}
                                        variant="secondary"
                                        disabled={Object.keys(nodes).length === 0}
                                    >
                                        {t("testClusterAvailability")}
                                    </Button>
                                    <Button
                                        id="registerNodeManually"
                                        data-testid="registerNodeManually"
                                        onClick={() => setAddNodeOpen(true)}
                                        variant="outline"
                                    >
                                        {t("registerNodeManually")}
                                    </Button>
                                </div>
                            }
                        />
                    </CollapsibleContent>
                </Collapsible>
            </>
        </>
    );
};
