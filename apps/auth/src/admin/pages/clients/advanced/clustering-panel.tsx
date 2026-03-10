import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from "@merge-rd/ui/components/collapsible";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import { Label } from "@merge-rd/ui/components/label";
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
import { DotsThree } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    HelpItem
} from "@/shared/keycloak-ui-shared";
import { useDeleteClusterNode, useTestNodesAvailable } from "../hooks/use-cluster-nodes";
import { useFormatDate, FORMAT_DATE_AND_TIME } from "@/admin/shared/lib/use-format-date";
import { useConfirmDialog } from "@/admin/shared/ui/confirm-dialog/confirm-dialog";
import { FormAccess } from "@/admin/shared/ui/form/form-access";
import { TimeSelectorForm } from "@/admin/shared/ui/time-selector/time-selector-form";
import { type AdvancedProps, parseResult } from "../advanced-tab";
import { AddHostDialog } from "./add-host-dialog";

type Node = {
    host: string;
    registration: string;
};

export const ClusteringPanel = ({
    save,
    client: { id, registeredNodes, access }
}: AdvancedProps) => {

    const { t } = useTranslation();
    const formatDate = useFormatDate();
    const { mutateAsync: deleteClusterNode } = useDeleteClusterNode();
    const { mutateAsync: testNodesAvailableMutation } = useTestNodesAvailable();

    const [nodes, setNodes] = useState(registeredNodes || {});
    const [expanded, setExpanded] = useState(false);
    const [selectedNode, setSelectedNode] = useState("");
    const [addNodeOpen, setAddNodeOpen] = useState(false);
    const [key, setKey] = useState(0);
    const refresh = () => setKey(Date.now());

    const nodeData = useMemo(
        () =>
            Object.entries(nodes || {}).map(entry => ({
                host: entry[0],
                registration: entry[1]
            })),
        [nodes]
    );

    const testCluster = async () => {
        const result = await testNodesAvailableMutation(id!);
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
                await deleteClusterNode({ clientId: id!, node: selectedNode });
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
                toast.error(t("deleteNodeFail", { error: getErrorMessage(error) }), {
                    description: getErrorDescription(error)
                });
            }
        }
    });

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    const filteredNodes = useMemo(() => {
        if (!search) return nodeData;
        const lower = search.toLowerCase();
        return nodeData.filter(n => n.host.toLowerCase().includes(lower));
    }, [nodeData, search]);

    const totalCount = filteredNodes.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedNodes = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredNodes.slice(start, start + pageSize);
    }, [filteredNodes, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const columnCount = 3;

    return (
        <>
            <FormAccess
                role="manage-clients"
                fineGrainedAccess={access?.configure}
                isHorizontal
            >
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="kc-node-reregistration-timeout">
                            {t("nodeReRegistrationTimeout")}
                        </Label>
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
                            <Button variant="secondary" onClick={() => save()}>
                                {t("save")}
                            </Button>
                        </div>
                    </div>
                </div>
            </FormAccess>

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
                    <div key={key} className="flex h-full w-full flex-col">
                        <div className="flex items-center justify-between gap-2 py-2.5">
                            <FacetedFormFilter
                                type="text"
                                size="small"
                                title={t("search")}
                                value={search}
                                onChange={value => setSearch(value)}
                                placeholder={t("searchByHost")}
                            />
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
                        </div>

                        <Table className="table-fixed">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40%]">{t("nodeHost")}</TableHead>
                                    <TableHead className="w-[40%]">{t("lastRegistration")}</TableHead>
                                    <TableHead className="w-[20%]" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedNodes.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columnCount}
                                            className="text-center text-muted-foreground"
                                        >
                                            {t("noNodes")}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedNodes.map(node => (
                                        <TableRow key={node.host}>
                                            <TableCell className="truncate">
                                                {node.host}
                                            </TableCell>
                                            <TableCell className="truncate">
                                                {node.registration
                                                    ? formatDate(
                                                          new Date(
                                                              parseInt(node.registration.toString(), 10) * 1000
                                                          ),
                                                          FORMAT_DATE_AND_TIME
                                                      )
                                                    : ""}
                                            </TableCell>
                                            <TableCell>
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
                                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={() => {
                                                                setSelectedNode(node.host);
                                                                toggleDeleteNodeConfirm();
                                                            }}
                                                        >
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
                                    <TableCell colSpan={columnCount} className="p-0">
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
                </CollapsibleContent>
            </Collapsible>
        </>
    );
};
