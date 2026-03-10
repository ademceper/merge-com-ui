import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
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
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
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
import { DotsThree, PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage
} from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { useDeleteRegistrationPolicy } from "../hooks/use-delete-registration-policy";
import type { ClientRegistrationParams } from "@/admin/shared/lib/routes/clients";
import { clientKeys } from "../hooks/keys";
import { useClientRegistrationPolicies } from "../hooks/use-client-registration-policies";
import { AddClientRegistrationPolicyDialog } from "./add-client-registration-policy-dialog";
import { EditClientRegistrationPolicyDialog } from "./edit-client-registration-policy-dialog";

type ClientRegistrationListProps = {
    subType: "anonymous" | "authenticated";
};

export const ClientRegistrationList = ({ subType }: ClientRegistrationListProps) => {

    const { t } = useTranslation();
    const { subTab: _subTab } = useParams({ strict: false }) as ClientRegistrationParams;
    const { realm } = useRealm();
    const queryClient = useQueryClient();
    const { mutateAsync: deletePolicy } = useDeleteRegistrationPolicy();
    const { data: policies = [] } = useClientRegistrationPolicies(subType);
    const [selectedPolicy, setSelectedPolicy] = useState<ComponentRepresentation>();
    const [editPolicy, setEditPolicy] = useState<ComponentRepresentation>();
    const refresh = () => {
        queryClient.invalidateQueries({
            queryKey: clientKeys.registrationPolicies(subType)
        });
    };

    const onDeleteConfirm = async () => {
        if (!selectedPolicy?.id) return;
        try {
            await deletePolicy(selectedPolicy.id);
            toast.success(t("clientRegisterPolicyDeleteSuccess"));
            setSelectedPolicy(undefined);
            refresh();
        } catch (error) {
            toast.error(
                t("clientRegisterPolicyDeleteError", { error: getErrorMessage(error) }),
                { description: getErrorDescription(error) }
            );
        }
    };

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    const filteredPolicies = useMemo(() => {
        if (!search) return policies;
        const lower = search.toLowerCase();
        return policies.filter(p => p.name?.toLowerCase().includes(lower));
    }, [policies, search]);

    const totalCount = filteredPolicies.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedPolicies = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredPolicies.slice(start, start + pageSize);
    }, [filteredPolicies, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const columnCount = 3;

    return (
        <>
            <AlertDialog
                open={!!selectedPolicy}
                onOpenChange={open => !open && setSelectedPolicy(undefined)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("clientRegisterPolicyDeleteConfirmTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("clientRegisterPolicyDeleteConfirm", {
                                name: selectedPolicy?.name
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

            <EditClientRegistrationPolicyDialog
                policy={editPolicy ?? null}
                subTab={subType}
                onClose={() => setEditPolicy(undefined)}
                onSuccess={refresh}
            />

            <div className="flex h-full w-full flex-col">
                <div className="flex items-center justify-between gap-2 py-2.5">
                    <FacetedFormFilter
                        type="text"
                        size="small"
                        title={t("search")}
                        value={search}
                        onChange={value => setSearch(value)}
                        placeholder={t("searchClientRegistration")}
                    />
                    <AddClientRegistrationPolicyDialog
                        subTab={subType}
                        onSuccess={refresh}
                        trigger={
                            <Button
                                type="button"
                                data-testid={`createPolicy-${subType}`}
                                variant="default"
                                className="flex h-9 w-9 shrink-0 items-center justify-center p-0 sm:h-9 sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
                                aria-label={t("createPolicy")}
                            >
                                <Plus size={20} className="shrink-0 sm:hidden" />
                                <span className="hidden sm:inline">
                                    {t("createPolicy")}
                                </span>
                            </Button>
                        }
                    />
                </div>

                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]">{t("name")}</TableHead>
                            <TableHead className="w-[40%]">{t("providerId")}</TableHead>
                            <TableHead className="w-[20%]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedPolicies.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columnCount}
                                    className="text-center text-muted-foreground"
                                >
                                    {t("noAccessPolicies")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedPolicies.map(policy => (
                                <TableRow
                                    key={policy.id}
                                    className="cursor-pointer"
                                    onClick={() => setEditPolicy(policy)}
                                >
                                    <TableCell className="truncate">
                                        <button
                                            type="button"
                                            className="text-primary hover:underline text-left"
                                            onClick={e => {
                                                e.stopPropagation();
                                                setEditPolicy(policy);
                                            }}
                                        >
                                            {policy.name}
                                        </button>
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {policy.providerId || "-"}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={e => e.stopPropagation()}
                                                >
                                                    <DotsThree
                                                        weight="bold"
                                                        className="size-4"
                                                    />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        setEditPolicy(policy);
                                                    }}
                                                >
                                                    <PencilSimple className="size-4 shrink-0" />
                                                    {t("edit")}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        setSelectedPolicy(policy);
                                                    }}
                                                >
                                                    <Trash className="size-4 shrink-0" />
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
        </>
    );
};
