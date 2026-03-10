import { Trans, useTranslation } from "@merge-rd/i18n";
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
    TableRow,
    type TableSortDirection
} from "@merge-rd/ui/components/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge-rd/ui/components/tabs";
import { Copy, DotsThree, Link as LinkIcon, Trash } from "@phosphor-icons/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage
} from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import type { AuthenticationTab } from "@/admin/shared/lib/routes/authentication";
import {
    toAuthentication,
    toCreateFlow,
    toFlow
} from "@/admin/shared/lib/routes/authentication";
import { useParams } from "@/admin/shared/lib/use-params";
import { useToggle } from "@/admin/shared/lib/use-toggle";
import { useDeleteFlow } from "./hooks/use-delete-flow";
import { useFlows } from "./hooks/use-flows";
import { BindFlowDialog } from "./bind-flow-dialog";
import { UsedBy } from "./components/used-by";
import type { AuthenticationType } from "./constants";
import { DuplicateFlowModal } from "./duplicate-flow-modal";
import { Policies } from "./policies/policies";
import { RequiredActions } from "./required-actions";

export function AuthenticationSection() {
    const { t } = useTranslation();
    const { realm: realmName, realmRepresentation: realm } = useRealm();
    const { tab } = useParams<{ tab?: string }>();
    const navigate = useNavigate();
    const [selectedFlow, setSelectedFlow] = useState<AuthenticationType>();
    const [flowToDelete, setFlowToDelete] = useState<AuthenticationType>();
    const [open, toggleOpen] = useToggle();
    const [bindFlowOpen, toggleBindFlow] = useToggle();

    const { mutateAsync: deleteFlowAsync } = useDeleteFlow();
    const isFlowsTab = tab !== "required-actions" && tab !== "policies";
    const { data: flows = [] } = useFlows(isFlowsTab);

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [sortBy, setSortBy] = useState<"alias" | null>(null);
    const [sortDirection, setSortDirection] = useState<TableSortDirection>(false);

    const toggleSort = (column: "alias") => {
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

    const filteredFlows = useMemo(() => {
        let result = flows;
        if (search) {
            const lower = search.toLowerCase();
            result = result.filter(f => f.alias?.toLowerCase().includes(lower));
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
    }, [flows, search, sortBy, sortDirection]);

    const totalCount = filteredFlows.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedFlows = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredFlows.slice(start, start + pageSize);
    }, [filteredFlows, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const onDeleteFlowConfirm = async () => {
        if (!flowToDelete?.id) return;
        try {
            await deleteFlowAsync(flowToDelete.id);
            setFlowToDelete(undefined);
            toast.success(t("deleteFlowSuccess"));
        } catch (error) {
            toast.error(t("deleteFlowError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const renderContent = () => {
        switch (tab) {
            case "required-actions":
                return <RequiredActions />;
            case "policies":
                return <Policies />;
            default:
                return (
                    <>
                        <AlertDialog
                            open={!!flowToDelete}
                            onOpenChange={open => !open && setFlowToDelete(undefined)}
                        >
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        {t("deleteConfirmFlow")}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        <Trans i18nKey="deleteConfirmFlowMessage">
                                            {" "}
                                            <strong>
                                                {{ flow: flowToDelete?.alias ?? "" }}
                                            </strong>
                                            .
                                        </Trans>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                                    <AlertDialogAction
                                        variant="destructive"
                                        data-testid="confirm"
                                        onClick={onDeleteFlowConfirm}
                                    >
                                        {t("delete")}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        {open && selectedFlow && (
                            <DuplicateFlowModal
                                name={selectedFlow.alias!}
                                description={selectedFlow.description!}
                                toggleDialog={toggleOpen}
                                onComplete={() => {
                                    toggleOpen();
                                }}
                            />
                        )}
                        {bindFlowOpen && (
                            <BindFlowDialog
                                onClose={() => {
                                    toggleBindFlow();
                                }}
                                flowAlias={selectedFlow?.alias!}
                            />
                        )}
                        <div className="flex h-full w-full flex-col">
                            <div className="flex items-center justify-between gap-2 py-2.5">
                                <FacetedFormFilter
                                    type="text"
                                    size="small"
                                    title={t("search")}
                                    value={search}
                                    onChange={value => setSearch(value)}
                                    placeholder={t("searchForFlow")}
                                />
                                <Button
                                    asChild
                                    variant="default"
                                    size="sm"
                                >
                                    <Link
                                        to={
                                            toCreateFlow({
                                                realm: realmName
                                            }) as string
                                        }
                                    >
                                        {t("createFlow")}
                                    </Link>
                                </Button>
                            </div>

                            <Table className="table-fixed">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead
                                            className="w-[30%]"
                                            sortable
                                            sortDirection={sortBy === "alias" ? sortDirection : false}
                                            onSort={() => toggleSort("alias")}
                                        >
                                            {t("flowName")}
                                        </TableHead>
                                        <TableHead className="w-[25%]">
                                            {t("usedBy")}
                                        </TableHead>
                                        <TableHead className="w-[30%]">
                                            {t("description")}
                                        </TableHead>
                                        <TableHead className="w-[15%]" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedFlows.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="text-center text-muted-foreground"
                                            >
                                                {t("emptyEvents")}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedFlows.map(flow => (
                                            <TableRow key={flow.id}>
                                                <TableCell className="truncate">
                                                    <Link
                                                        to={
                                                            toFlow({
                                                                realm: realmName!,
                                                                id: flow.id!,
                                                                usedBy: flow.usedBy?.type || "notInUse",
                                                                builtIn: flow.builtIn ? "builtIn" : undefined
                                                            }) as string
                                                        }
                                                        className="text-primary hover:underline"
                                                    >
                                                        {flow.alias}
                                                    </Link>{" "}
                                                    {flow.builtIn && <Label>{t("buildIn")}</Label>}
                                                </TableCell>
                                                <TableCell className="truncate">
                                                    <UsedBy authType={flow} />
                                                </TableCell>
                                                <TableCell className="truncate">
                                                    {flow.description ?? "-"}
                                                </TableCell>
                                                <TableCell onClick={e => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon-sm"
                                                            >
                                                                <DotsThree
                                                                    weight="bold"
                                                                    className="size-4"
                                                                />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setSelectedFlow(flow);
                                                                    toggleOpen();
                                                                }}
                                                            >
                                                                <Copy className="size-4" />
                                                                {t("duplicate")}
                                                            </DropdownMenuItem>
                                                            {flow.usedBy?.type !== "DEFAULT" && (
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setSelectedFlow(flow);
                                                                        toggleBindFlow();
                                                                    }}
                                                                >
                                                                    <LinkIcon className="size-4" />
                                                                    {t("bindFlow")}
                                                                </DropdownMenuItem>
                                                            )}
                                                            {!flow.builtIn && !flow.usedBy && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        className="text-destructive focus:text-destructive"
                                                                        onClick={() => setFlowToDelete(flow)}
                                                                    >
                                                                        <Trash className="size-4" />
                                                                        {t("delete")}
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
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
    };

    const currentTab: AuthenticationTab =
        tab === "required-actions" || tab === "policies" ? tab : "flows";

    return (
        <div className="p-0">
            <Tabs
                value={currentTab}
                onValueChange={value =>
                    navigate({
                        to: toAuthentication({
                            realm: realmName,
                            tab:
                                value === "flows"
                                    ? undefined
                                    : (value as AuthenticationTab)
                        }) as string
                    })
                }
            >
                <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden mb-4">
                    <TabsList
                        variant="line"
                        className="mb-0 w-max min-w-0 **:data-[slot=tabs-trigger]:flex-none"
                    >
                        <TabsTrigger value="flows" data-testid="authentication-flows-tab">
                            {t("flows")}
                        </TabsTrigger>
                        <TabsTrigger
                            value="required-actions"
                            data-testid="authentication-required-actions-tab"
                        >
                            {t("requiredActions")}
                        </TabsTrigger>
                        <TabsTrigger
                            value="policies"
                            data-testid="authentication-policies-tab"
                        >
                            {t("policies")}
                        </TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="flows" className="mt-0 pt-0 outline-none">
                    {renderContent()}
                </TabsContent>
                <TabsContent value="required-actions" className="mt-0 pt-0 outline-none">
                    {renderContent()}
                </TabsContent>
                <TabsContent value="policies" className="mt-0 pt-0 outline-none">
                    {renderContent()}
                </TabsContent>
            </Tabs>
        </div>
    );
}
