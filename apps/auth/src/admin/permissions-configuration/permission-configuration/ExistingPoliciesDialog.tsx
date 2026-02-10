import PolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import { PolicyQuery } from "@keycloak/keycloak-admin-client/lib/resources/clients";
import { useFetch } from "../../../shared/keycloak-ui-shared";
import { DataTable, type ColumnDef } from "@merge/ui/components/table";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge/ui/components/empty";
import { Button } from "@merge/ui/components/button";
import { Checkbox } from "@merge/ui/components/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@merge/ui/components/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@merge/ui/components/dropdown-menu";
import { Funnel, CaretDown } from "@phosphor-icons/react";
import { sortBy } from "lodash-es";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { capitalizeFirstLetterFormatter } from "../../util";
import useToggle from "../../utils/useToggle";

export type ExistingPoliciesDialogProps = {
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
    const { adminClient } = useAdminClient();
    const [rows, setRows] = useState<PolicyRepresentation[]>([]);
    const [filterType, setFilterType] = useState<string | undefined>(undefined);
    const [_isFilterTypeDropdownOpen, _toggleIsFilterTypeDropdownOpen] = useToggle();
    const [providers, setProviders] = useState<string[]>([]);

    useFetch(
        () =>
            adminClient.clients.listPolicyProviders({
                id: permissionClientId!
            }),
        providers => {
            const formattedProviders = providers
                .filter(p => p.type !== "resource" && p.type !== "scope")
                .map(provider => provider.name)
                .filter(name => name !== undefined);
            setProviders(sortBy(formattedProviders));
        },
        [permissionClientId]
    );

    const [policiesData, setPoliciesData] = useState<PolicyRepresentation[]>([]);

    useFetch(
        async () => {
            const params: PolicyQuery = {
                id: permissionClientId!,
                permission: "false",
                first: 0,
                max: 500
            };
            if (filterType) params.type = filterType;
            return (await adminClient.clients.listPolicies(params)) || [];
        },
        setPoliciesData,
        [permissionClientId, filterType]
    );

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
        { accessorKey: "type", header: t("type"), cell: ({ getValue }) => capitalizeFirstLetterFormatter()(getValue()) },
        { accessorKey: "description", header: t("description") }
    ];

    const emptyContent = (
        <Empty className="py-12">
            <EmptyHeader><EmptyTitle>{t("emptyAssignExistingPolicies")}</EmptyTitle></EmptyHeader>
            <EmptyContent><EmptyDescription>{t("emptyAssignExistingPoliciesInstructions")}</EmptyDescription></EmptyContent>
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
                                <Button variant="outline" data-testid="filter-type-dropdown-existingPolicies">
                                    <Funnel className="size-4 mr-1" />
                                    {filterType ? filterType : t("allTypes")}
                                    <CaretDown className="size-4 ml-1" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem data-testid="filter-type-dropdown-existingPolicies-all" onClick={() => setFilterType(undefined)}>{t("allTypes")}</DropdownMenuItem>
                                {providers.map(name => (
                                    <DropdownMenuItem data-testid={`filter-type-dropdown-existingPolicies-${name}`} key={name} onClick={() => setFilterType(name)}>{name}</DropdownMenuItem>
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
