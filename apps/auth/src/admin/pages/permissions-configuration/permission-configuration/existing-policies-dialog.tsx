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
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@merge-rd/ui/components/table";
import { CaretDown, Funnel } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { useToggle } from "@/admin/shared/lib/use-toggle";
import { capitalizeFirstLetterFormatter } from "@/admin/shared/lib/util";
import { usePoliciesList } from "../hooks/use-policies-list";
import { usePolicyProviders } from "../hooks/use-policy-providers";

type ExistingPoliciesDialogProps = {
    toggleDialog: () => void;
    onAssign: (policies: { policy: PolicyRepresentation }[]) => void;
    open: boolean;
    permissionClientId: string;
};

const COLUMN_COUNT = 4;

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
    const [search, setSearch] = useState("");

    const { data: providers = [] } = usePolicyProviders(permissionClientId);
    const { data: policiesData = [] } = usePoliciesList(permissionClientId, filterType);

    const filteredPolicies = useMemo(() => {
        if (!search) return policiesData;
        const lower = search.toLowerCase();
        return policiesData.filter(p => p.name?.toLowerCase().includes(lower));
    }, [policiesData, search]);

    return (
        <Dialog open={open} onOpenChange={toggleDialog}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{t("assignExistingPolicies")}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-wrap items-center gap-2 py-2.5">
                    <FacetedFormFilter
                        type="text"
                        size="small"
                        title={t("search")}
                        value={search}
                        onChange={value => setSearch(value)}
                        placeholder={t("searchClientAuthorizationPolicy")}
                    />
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
                </div>
                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10" />
                            <TableHead className="w-[30%]">{t("name")}</TableHead>
                            <TableHead className="w-[20%]">{t("type")}</TableHead>
                            <TableHead className="w-[40%]">
                                {t("description")}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPolicies.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={COLUMN_COUNT}
                                    className="text-center text-muted-foreground"
                                >
                                    <Empty className="py-12">
                                        <EmptyHeader>
                                            <EmptyTitle>
                                                {t("emptyAssignExistingPolicies")}
                                            </EmptyTitle>
                                        </EmptyHeader>
                                        <EmptyContent>
                                            <EmptyDescription>
                                                {t(
                                                    "emptyAssignExistingPoliciesInstructions"
                                                )}
                                            </EmptyDescription>
                                        </EmptyContent>
                                    </Empty>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPolicies.map(policy => (
                                <TableRow key={policy.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={rows.some(
                                                r => r.id === policy.id
                                            )}
                                            onCheckedChange={() => {
                                                setRows(prev =>
                                                    prev.some(
                                                        r => r.id === policy.id
                                                    )
                                                        ? prev.filter(
                                                              r =>
                                                                  r.id !== policy.id
                                                          )
                                                        : [...prev, policy]
                                                );
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {policy.name}
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {capitalizeFirstLetterFormatter()(policy.type)}
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {policy.description}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
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
