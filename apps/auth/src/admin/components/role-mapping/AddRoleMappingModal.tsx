import RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { KeycloakDataTable, ListEmptyState, cellWidth } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@merge/ui/components/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@merge/ui/components/dropdown-menu";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { useAccess } from "../../context/access/Access";
import { translationFormatter } from "../../utils/translationFormatter";
import useLocaleSort from "../../utils/useLocaleSort";
import { ResourcesKey, Row } from "./RoleMapping";
import { getAvailableRoles } from "./queries";
import { getAvailableClientRoles } from "./resource";

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
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const [selectedRows, setSelectedRows] = useState<Row[]>([]);

    const localeSort = useLocaleSort();
    const compareRow = ({ role: { name } }: Row) => name?.toUpperCase();

    const loader = async (
        first?: number,
        max?: number,
        search?: string
    ): Promise<Row[]> => {
        const params: Record<string, string | number> = {
            first: first!,
            max: max!
        };

        if (search) {
            params.search = search;
        }

        const roles = await getAvailableRoles(adminClient, type, { ...params, id });
        const sorted = localeSort(roles, compareRow);
        return sorted.map(row => {
            return {
                role: row.role,
                id: row.role.id
            };
        });
    };

    const clientRolesLoader = async (
        first?: number,
        max?: number,
        search?: string
    ): Promise<Row[]> => {
        const roles = await getAvailableClientRoles(adminClient, {
            id,
            type,
            first: first || 0,
            max: max || 10,
            search
        });

        return localeSort(
            roles.map(e => ({
                client: { clientId: e.client, id: e.clientId },
                role: { id: e.id, name: e.role, description: e.description },
                id: e.id
            })),
            ({ client: { clientId }, role: { name } }) => `${clientId}${name}`
        );
    };

    const columns = [
        {
            name: "role.name",
            displayKey: "name",
            transforms: [cellWidth(30)]
        },
        {
            name: "client.clientId",
            displayKey: "clientId"
        },
        {
            name: "role.description",
            displayKey: "description",
            cellRenderer: RoleDescription
        }
    ];

    if (filterType === "roles") {
        columns.splice(1, 1);
    }

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
                <KeycloakDataTable
                onSelect={rows => setSelectedRows([...rows])}
                searchPlaceholderKey={
                    filterType === "roles" ? "searchByRoleName" : "search"
                }
                isPaginated={!(filterType === "roles" && type !== "roles")}
                canSelectAll
                isRadio={isRadio}
                loader={filterType === "roles" ? loader : clientRolesLoader}
                ariaLabelKey="associatedRolesText"
                columns={columns}
                emptyState={
                    <ListEmptyState
                        message={t("noRoles")}
                        instructions={t("noRealmRolesToAssign")}
                    />
                }
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
