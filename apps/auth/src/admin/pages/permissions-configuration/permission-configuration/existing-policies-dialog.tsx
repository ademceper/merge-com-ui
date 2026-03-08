import type PolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
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
import { CaretDown, Funnel } from "@phosphor-icons/react";
import { useState } from "react";
import { type ColumnDef, DataTable } from "@/admin/shared/ui/data-table";
import useToggle from "../../../shared/lib/useToggle";
import { capitalizeFirstLetterFormatter } from "../../../shared/lib/util";
import { usePoliciesList } from "../api/use-policies-list";
import { usePolicyProviders } from "../api/use-policy-providers";

type ExistingPoliciesDialogProps = {
    toggleDialog: () => void;
    onAssign: (policies: { policy: PolicyRepresentation }[]) => void;
    open: boolean;
    permissionClientId: string;
};

export const ExistingPoliciesDialog = ({
    toggleDialog,
    onAssign,
    open,
    permissionClientId
}: ExistingPoliciesDialogProps) => {
    const { t } = useTranslation();
    const [rows, setRows] = useState<PolicyRepresentation[]>([]);
    const [filterType, setFilterType] = useState<string | undefined>(undefined);
    const [_isFilterTypeDropdownOpen, _toggleIsFilterTypeDropdownOpen] = useToggle();

    const { data: providers = [] } = usePolicyProviders(permissionClientId);
    const { data: policiesData = [] } = usePoliciesList(permissionClientId, filterType);

    const columns: ColumnDef<PolicyRepresentation>[] = [
        {
            id: "select",
            header: "",
            size: 40,
            cell: ({ row }) => (
                <Checkbox
                    checked={rows.some(r => r.id === row.original.id)}
                    onCheckedChange={() => {
                        setRows(prev =>
                            prev.some(r => r.id === row.original.id)
                                ? prev.filter(r => r.id !== row.original.id)
                                : [...prev, row.original]
                        );
                    }}
                />
            )
        },
        { accessorKey: "name", header: t("name") },
        {
            accessorKey: "type",
            header: t("type"),
            cell: ({ getValue }) => capitalizeFirstLetterFormatter()(getValue())
        },
        { accessorKey: "description", header: t("description") }
    ];

    const emptyContent = (
        <Empty className="py-12">
            <EmptyHeader>
                <EmptyTitle>{t("emptyAssignExistingPolicies")}</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
                <EmptyDescription>
                    {t("emptyAssignExistingPoliciesInstructions")}
                </EmptyDescription>
            </EmptyContent>
        </Empty>
    );

    return (
        <Dialog open={open} onOpenChange={toggleDialog}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{t("assignExistingPolicies")}</DialogTitle>
                </DialogHeader>
                <DataTable<PolicyRepresentation>
                    key={filterType}
                    columns={columns}
                    data={policiesData}
                    searchColumnId="name"
                    searchPlaceholder={t("searchClientAuthorizationPolicy")}
                    emptyContent={emptyContent}
                    emptyMessage={t("emptyAssignExistingPolicies")}
                    toolbar={
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    data-testid="filter-type-dropdown-existingPolicies"
                                >
                                    <Funnel className="size-4 mr-1" />
                                    {filterType ? filterType : t("allTypes")}
                                    <CaretDown className="size-4 ml-1" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem
                                    data-testid="filter-type-dropdown-existingPolicies-all"
                                    onClick={() => setFilterType(undefined)}
                                >
                                    {t("allTypes")}
                                </DropdownMenuItem>
                                {providers.map(name => (
                                    <DropdownMenuItem
                                        data-testid={`filter-type-dropdown-existingPolicies-${name}`}
                                        key={name}
                                        onClick={() => setFilterType(name)}
                                    >
                                        {name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    }
                />
                <DialogFooter>
                    <Button
                        id="modal-assignExistingPolicies"
                        data-testid="confirm"
                        onClick={() => {
                            const selectedPolicies = rows.map(policy => ({ policy }));
                            onAssign(selectedPolicies);
                            toggleDialog();
                        }}
                        disabled={rows.length === 0}
                    >
                        {t("assign")}
                    </Button>
                    <Button
                        id="modal-cancelExistingPolicies"
                        data-testid="cancel"
                        variant="link"
                        onClick={() => {
                            setRows([]);
                            toggleDialog();
                        }}
                    >
                        {t("cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
