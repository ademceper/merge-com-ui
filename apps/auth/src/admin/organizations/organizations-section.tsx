import OrganizationRepresentation from "@keycloak/keycloak-admin-client/lib/defs/organizationRepresentation";
import { getErrorDescription, getErrorMessage, useFetch } from "../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import { Button } from "@merge-rd/ui/components/button";
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
import {
    Drawer,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle
} from "@merge-rd/ui/components/drawer";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
    TablePaginationFooter,
    type TableSortDirection
} from "@merge-rd/ui/components/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { DotsThree, PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { FormAccess } from "../components/form/form-access";
import { useRealm } from "../context/realm-context/realm-context";
import {
    OrganizationForm,
    OrganizationFormType,
    convertToOrg
} from "./organization-form";
import { toEditOrganization } from "./routes/edit-organization";

export default function OrganizationSection() {
    const { adminClient } = useAdminClient();
    const { realm } = useRealm();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);

    const [organizations, setOrganizations] = useState<OrganizationRepresentation[]>([]);
    const [selectedOrg, setSelectedOrg] = useState<OrganizationRepresentation>();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [sortBy, setSortBy] = useState<"name" | "description" | null>(null);
    const [sortDirection, setSortDirection] = useState<TableSortDirection>(false);
    const createForm = useForm<OrganizationFormType>({ mode: "onChange" });

    const toggleSort = (column: "name" | "description") => {
        if (sortBy === column) {
            setSortDirection((prev) =>
                prev === "asc" ? "desc" : prev === "desc" ? false : "asc"
            );
            if (sortDirection === "desc") setSortBy(null);
        } else {
            setSortBy(column);
            setSortDirection("asc");
        }
    };

    useEffect(() => {
        if (createDialogOpen) {
            createForm.reset({});
        }
    }, [createDialogOpen]);

    useFetch(
        () => adminClient.organizations.find({ first: 0, max: 1000 }),
        (orgs) => setOrganizations(orgs),
        [key]
    );

    const filteredOrganizations = useMemo(() => {
        let result = organizations;
        if (search) {
            const lower = search.toLowerCase();
            result = result.filter((org) =>
                org.name?.toLowerCase().includes(lower)
            );
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
    }, [organizations, search, sortBy, sortDirection]);

    const totalCount = filteredOrganizations.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedOrganizations = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredOrganizations.slice(start, start + pageSize);
    }, [filteredOrganizations, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const onDeleteConfirm = async () => {
        if (!selectedOrg?.id) return;
        try {
            await adminClient.organizations.delById({ id: selectedOrg.id });
            toast.success(t("organizationDeletedSuccess"));
            setSelectedOrg(undefined);
            refresh();
        } catch (error) {
            toast.error(t("organizationDeleteError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const onCreateSave = async (org: OrganizationFormType) => {
        try {
            const organization = convertToOrg(org);
            await adminClient.organizations.create(organization);
            toast.success(t("organizationSaveSuccess"));
            setCreateDialogOpen(false);
            createForm.reset();
            refresh();
        } catch (error) {
            toast.error(t("organizationSaveError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <>
            <AlertDialog open={!!selectedOrg} onOpenChange={(open) => !open && setSelectedOrg(undefined)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("organizationDelete")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("organizationDeleteConfirm")}</AlertDialogDescription>
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

            <Drawer open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DrawerContent>
                    <FormProvider {...createForm}>
                        <DrawerHeader>
                            <DrawerTitle>{t("createOrganization")}</DrawerTitle>
                        </DrawerHeader>
                        <div className="flex-1 overflow-y-auto px-4">
                            <FormAccess
                                id="create-org-form"
                                role="anyone"
                                onSubmit={createForm.handleSubmit(onCreateSave)}
                                isHorizontal
                            >
                                <OrganizationForm />
                            </FormAccess>
                        </div>
                        <DrawerFooter>
                            <Button
                                type="submit"
                                form="create-org-form"
                                data-testid="save"
                                disabled={
                                    !createForm.formState.isValid ||
                                    !createForm.formState.isDirty ||
                                    createForm.formState.isLoading ||
                                    createForm.formState.isValidating ||
                                    createForm.formState.isSubmitting
                                }
                            >
                                {t("save")}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCreateDialogOpen(false)}
                            >
                                {t("cancel")}
                            </Button>
                        </DrawerFooter>
                    </FormProvider>
                </DrawerContent>
            </Drawer>

            <div className="flex h-full w-full flex-col">
                <div className="flex items-center justify-between gap-2 py-2.5">
                    <FacetedFormFilter
                        type="text"
                        size="small"
                        title={t("search")}
                        value={search}
                        onChange={(value) => setSearch(value)}
                        placeholder={t("searchOrganization")}
                    />
                    <Button
                        type="button"
                        data-testid="addOrganization"
                        variant="default"
                        size="sm"
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        <Plus className="size-4" />
                        <span>{t("createOrganization")}</span>
                    </Button>
                </div>

                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead
                                className="w-[30%]"
                                sortable
                                sortDirection={sortBy === "name" ? sortDirection : false}
                                onSort={() => toggleSort("name")}
                            >
                                {t("name")}
                            </TableHead>
                            <TableHead className="w-[25%]">{t("domains")}</TableHead>
                            <TableHead
                                className="w-[35%]"
                                sortable
                                sortDirection={sortBy === "description" ? sortDirection : false}
                                onSort={() => toggleSort("description")}
                            >
                                {t("description")}
                            </TableHead>
                            <TableHead className="w-[10%]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedOrganizations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    {t("emptyOrganizations")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedOrganizations.map((org) => (
                                <TableRow
                                    key={org.id}
                                    className="cursor-pointer"
                                    onClick={() => navigate(toEditOrganization({ realm, id: org.id!, tab: "settings" }))}
                                >
                                    <TableCell className="truncate">{org.name}</TableCell>
                                    <TableCell className="truncate">
                                        {org.domains && org.domains.length > 0
                                            ? org.domains.map(d => d.name).join(", ")
                                            : "-"}
                                    </TableCell>
                                    <TableCell className="truncate">{org.description || "-"}</TableCell>
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon-sm">
                                                    <DotsThree weight="bold" className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => navigate(toEditOrganization({ realm, id: org.id!, tab: "settings" }))}
                                                >
                                                    <PencilSimple className="size-4" />
                                                    {t("edit")}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => setSelectedOrg(org)}
                                                >
                                                    <Trash className="size-4" />
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
                            <TableCell colSpan={4} className="p-0">
                                <TablePaginationFooter
                                    pageSize={pageSize}
                                    onPageSizeChange={setPageSize}
                                    onPreviousPage={() => setCurrentPage((p) => Math.max(0, p - 1))}
                                    onNextPage={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
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
