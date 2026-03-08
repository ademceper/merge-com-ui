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
import { useState } from "react";
import { type ColumnDef, DataTable } from "@/admin/shared/ui/data-table";
import { useAccess } from "../../../app/providers/access/access";
import { useAvailableRoleMappings } from "../../api/use-available-role-mappings";
import { translationFormatter } from "../../lib/translationFormatter";
import useLocaleSort from "../../lib/useLocaleSort";
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

    const columns: ColumnDef<Row>[] = [
        {
            id: "select",
            header: "",
            size: 40,
            cell: ({ row }) => (
                <Checkbox
                    checked={selectedRows.some(s => s.id === row.original.id)}
                    onCheckedChange={() => {
                        if (isRadio) {
                            setSelectedRows([row.original]);
                        } else {
                            setSelectedRows(prev =>
                                prev.some(s => s.id === row.original.id)
                                    ? prev.filter(s => s.id !== row.original.id)
                                    : [...prev, row.original]
                            );
                        }
                    }}
                />
            )
        },
        {
            accessorKey: "role.name",
            header: t("name"),
            cell: ({ row }) => row.original.role?.name ?? "—"
        },
        ...(filterType === "clients"
            ? [
                  {
                      accessorKey: "client.clientId",
                      header: t("clientId"),
                      cell: ({ row }: { row: { original: Row } }) =>
                          row.original.client?.clientId ?? "—"
                  } as ColumnDef<Row>
              ]
            : []),
        {
            accessorKey: "role.description",
            header: t("description"),
            cell: ({ row }) => <RoleDescription role={row.original.role!} />
        }
    ];

    const emptyContent = (
        <Empty className="py-12">
            <EmptyHeader>
                <EmptyTitle>{t("noRoles")}</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
                <EmptyDescription>{t("noRealmRolesToAssign")}</EmptyDescription>
            </EmptyContent>
        </Empty>
    );

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
                <DataTable<Row>
                    columns={columns}
                    data={rolesData}
                    searchColumnId={filterType === "roles" ? "role.name" : "role.name"}
                    searchPlaceholder={
                        filterType === "roles" ? t("searchByRoleName") : t("search")
                    }
                    emptyContent={emptyContent}
                    emptyMessage={t("noRoles")}
                />
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
