import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Checkbox } from "@merge-rd/ui/components/checkbox";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge-rd/ui/components/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge-rd/ui/components/empty";
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
import { useEffect, useMemo, useState } from "react";
import { useAccess } from "@/admin/app/providers/access/access";
import { useAvailableRoleMappings } from "@/admin/shared/api/use-available-role-mappings";
import { translationFormatter } from "@/admin/shared/lib/translation-formatter";
import { useLocaleSort } from "@/admin/shared/lib/use-locale-sort";
import type { ResourcesKey, Row } from "./role-mapping";

type AddRoleMappingModalProps = {
    id: string;
    type: ResourcesKey;
    filterType: FilterType;
    name?: string;
    isRadio?: boolean;
    onAssign: (rows: Row[]) => void;
    onClose: () => void;
    title?: string;
    actionLabel?: string;
};

export type FilterType = "roles" | "clients";

const RoleDescription = ({ role }: { role: RoleRepresentation }) => {
    const { t } = useTranslation();
    return (
        <span className="truncate block">
            {translationFormatter(t)(role.description) as string}
        </span>
    );
};

type AddRoleButtonProps = {
    label?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    isDisabled?: boolean;
    onFilerTypeChange: (type: FilterType) => void;
    children?: React.ReactNode;
};

export const AddRoleButton = ({
    label,
    variant = "default",
    isDisabled,
    onFilerTypeChange,
    children
}: AddRoleButtonProps) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const { hasAccess } = useAccess();
    const canViewRealmRoles = hasAccess("view-realm") || hasAccess("query-users");

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={variant}
                    disabled={isDisabled}
                    data-testid="add-role-mapping-button"
                >
                    {children ?? t(label || "assignRole")}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuItem
                    data-testid="client-role"
                    onClick={() => {
                        onFilerTypeChange("clients");
                        setOpen(false);
                    }}
                >
                    {t("clientRoles")}
                </DropdownMenuItem>
                {canViewRealmRoles && (
                    <DropdownMenuItem
                        data-testid="roles-role"
                        onClick={() => {
                            onFilerTypeChange("roles");
                            setOpen(false);
                        }}
                    >
                        {t("realmRoles")}
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const AddRoleMappingModal = ({
    id,
    name,
    type,
    isRadio,
    filterType,
    onAssign,
    onClose,
    title,
    actionLabel
}: AddRoleMappingModalProps) => {
    const { t } = useTranslation();
    const [selectedRows, setSelectedRows] = useState<Row[]>([]);

    const localeSort = useLocaleSort();

    const { data: rolesData = [] } = useAvailableRoleMappings(
        id,
        type,
        filterType,
        localeSort
    );

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    const filteredRoles = useMemo(() => {
        if (!search) return rolesData;
        const lower = search.toLowerCase();
        return rolesData.filter(r => r.role?.name?.toLowerCase().includes(lower));
    }, [rolesData, search]);

    const totalCount = filteredRoles.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedRoles = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredRoles.slice(start, start + pageSize);
    }, [filteredRoles, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const showClientColumn = filterType === "clients";
    const colSpan = showClientColumn ? 4 : 3;

    return (
        <Dialog open onOpenChange={open => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle>
                        {title ||
                            t("assignRolesTo", {
                                type: filterType === "roles" ? t("realm") : t("client"),
                                client: name
                            })}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex h-full w-full flex-col">
                    <div className="flex items-center justify-between gap-2 py-2.5">
                        <FacetedFormFilter
                            type="text"
                            size="small"
                            title={t("search")}
                            value={search}
                            onChange={value => setSearch(value)}
                            placeholder={
                                filterType === "roles" ? t("searchByRoleName") : t("search")
                            }
                        />
                    </div>

                    {totalCount === 0 && !search ? (
                        <Empty className="py-12">
                            <EmptyHeader>
                                <EmptyTitle>{t("noRoles")}</EmptyTitle>
                            </EmptyHeader>
                            <EmptyContent>
                                <EmptyDescription>{t("noRealmRolesToAssign")}</EmptyDescription>
                            </EmptyContent>
                        </Empty>
                    ) : (
                        <Table className="table-fixed">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-10" />
                                    <TableHead className="w-[30%]">{t("name")}</TableHead>
                                    {showClientColumn && (
                                        <TableHead className="w-[25%]">{t("clientId")}</TableHead>
                                    )}
                                    <TableHead>{t("description")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedRoles.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={colSpan}
                                            className="text-center text-muted-foreground"
                                        >
                                            {t("noRoles")}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedRoles.map(row => (
                                        <TableRow key={row.id ?? row.role?.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedRows.some(s => s.id === row.id)}
                                                    onCheckedChange={() => {
                                                        if (isRadio) {
                                                            setSelectedRows([row]);
                                                        } else {
                                                            setSelectedRows(prev =>
                                                                prev.some(s => s.id === row.id)
                                                                    ? prev.filter(s => s.id !== row.id)
                                                                    : [...prev, row]
                                                            );
                                                        }
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell className="truncate">
                                                {row.role?.name ?? "\u2014"}
                                            </TableCell>
                                            {showClientColumn && (
                                                <TableCell className="truncate">
                                                    {row.client?.clientId ?? "\u2014"}
                                                </TableCell>
                                            )}
                                            <TableCell className="truncate">
                                                <RoleDescription role={row.role!} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={colSpan} className="p-0">
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
                    )}
                </div>

                <DialogFooter>
                    <Button
                        data-testid="assign"
                        disabled={selectedRows.length === 0}
                        onClick={() => {
                            onAssign(selectedRows);
                            onClose();
                        }}
                    >
                        {actionLabel || t("assign")}
                    </Button>
                    <Button data-testid="cancel" variant="ghost" onClick={onClose}>
                        {t("cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
