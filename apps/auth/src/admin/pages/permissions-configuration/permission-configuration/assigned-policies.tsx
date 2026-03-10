import type PolicyProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyProviderRepresentation";
import type PolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
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
import { Label } from "@merge-rd/ui/components/label";
import { CaretDown, DotsThree, Funnel } from "@phosphor-icons/react";
import { capitalize, sortBy } from "lodash-es";
import { useEffect, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FormErrorText, HelpItem } from "@/shared/keycloak-ui-shared";
import { useToggle } from "@/admin/shared/lib/use-toggle";
import { usePolicyDetailsByType } from "../hooks/use-policy-details-by-type";
import { ExistingPoliciesDialog } from "./existing-policies-dialog";
import { NewPermissionPolicyDialog } from "./new-permission-policy-dialog";

type AssignedPoliciesProps = {
    permissionClientId: string;
    providers: PolicyProviderRepresentation[];
    policies: PolicyRepresentation[] | undefined;
    resourceType: string;
};

type AssignedPolicyForm = {
    policies?: { id: string; type?: string }[];
};

const COLUMN_COUNT = 4;

export const AssignedPolicies = ({
    permissionClientId,
    providers,
    policies,
    resourceType
}: AssignedPoliciesProps) => {
    const { t } = useTranslation();
    const {
        control,
        getValues,
        setValue,
        trigger,
        formState: { errors }
    } = useFormContext<AssignedPolicyForm>();
    const values = getValues("policies");
    const [existingPoliciesOpen, setExistingPoliciesOpen] = useState(false);
    const [newPolicyOpen, setNewPolicyOpen] = useState(false);
    const [selectedPolicies, setSelectedPolicies] = useState<PolicyRepresentation[]>([]);
    const [filterType, setFilterType] = useState<string | undefined>(undefined);
    const [_isFilterTypeDropdownOpen, _toggleIsFilterTypeDropdownOpen] = useToggle();
    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    const { data: policyDetailsData } = usePolicyDetailsByType(
        permissionClientId,
        values
    );

    useEffect(() => {
        if (policyDetailsData) {
            setSelectedPolicies(policyDetailsData);
        }
    }, [policyDetailsData]);

    const sortedProviders = sortBy(
        providers
            ? providers
                  .filter(p => p.type !== "resource" && p.type !== "scope")
                  .map(provider => provider.name)
            : []
    );

    const assign = async (policies: { policy: PolicyRepresentation }[]) => {
        const assignedPolicies = policies.map(({ policy }) => ({
            id: policy.id!
        }));

        setValue("policies", [...(getValues("policies") || []), ...assignedPolicies]);
        await trigger("policies");
        setSelectedPolicies([
            ...selectedPolicies,
            ...policies.map(({ policy }) => policy)
        ]);
    };

    const unAssign = (policy: PolicyRepresentation) => {
        const updatedPolicies = selectedPolicies.filter(
            selectedPolicy => selectedPolicy.id !== policy.id
        );
        setSelectedPolicies(updatedPolicies);
        setValue(
            "policies",
            updatedPolicies.map(policy => ({
                id: policy.id!,
                name: policy.name!,
                type: policy.type!,
                description: policy.description!
            }))
        );
    };

    const filteredByType = filterType
        ? selectedPolicies.filter(policy => capitalize(policy.type) === filterType)
        : selectedPolicies;

    const filteredPolicies = useMemo(() => {
        if (!search) return filteredByType;
        const lower = search.toLowerCase();
        return filteredByType.filter(p => p.name?.toLowerCase().includes(lower));
    }, [filteredByType, search]);

    const totalCount = filteredPolicies.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedPolicies = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredPolicies.slice(start, start + pageSize);
    }, [filteredPolicies, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize, filterType]);

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Label htmlFor="policies">{t("policies")} *</Label>
                <HelpItem
                    helpText={t("permissionPoliciesHelp")}
                    fieldLabelId="policies"
                />
            </div>
            <Controller
                name="policies"
                control={control}
                defaultValue={[]}
                rules={{
                    validate: (value?: { id: string }[]) => {
                        if (!value || value.length === 0) return false;
                        return value.every(({ id }) => id && id.trim().length > 0);
                    }
                }}
                render={() => (
                    <>
                        {existingPoliciesOpen && (
                            <ExistingPoliciesDialog
                                permissionClientId={permissionClientId}
                                open={existingPoliciesOpen}
                                toggleDialog={() =>
                                    setExistingPoliciesOpen(!existingPoliciesOpen)
                                }
                                onAssign={assign}
                            />
                        )}
                        {newPolicyOpen && (
                            <NewPermissionPolicyDialog
                                toggleDialog={() => setNewPolicyOpen(!newPolicyOpen)}
                                permissionClientId={permissionClientId}
                                providers={providers!}
                                policies={policies!}
                                resourceType={resourceType}
                                onAssign={async newPolicy => {
                                    await assign([{ policy: newPolicy }]);
                                }}
                            />
                        )}
                        <Button
                            data-testid="select-assignedPolicy-button"
                            variant="secondary"
                            onClick={() => {
                                setExistingPoliciesOpen(true);
                            }}
                        >
                            {t("assignExistingPolicies")}
                        </Button>
                        <Button
                            data-testid="select-createNewPolicy-button"
                            className="pf-v5-u-ml-md"
                            variant="secondary"
                            onClick={() => {
                                setNewPolicyOpen(true);
                            }}
                        >
                            {t("createNewPolicy")}
                        </Button>
                    </>
                )}
            />
            {selectedPolicies.length > 0 && (
                <div className="flex h-full w-full flex-col">
                    <div className="flex items-center justify-between gap-2 py-2.5">
                        <div className="flex flex-wrap items-center gap-2">
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
                                        {filterType
                                            ? capitalize(filterType)
                                            : t("allTypes")}
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
                                    {sortedProviders.map(name => (
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
                    </div>

                    <Table className="table-fixed">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[25%]">{t("name")}</TableHead>
                                <TableHead className="w-[20%]">{t("type")}</TableHead>
                                <TableHead className="w-[40%]">
                                    {t("description")}
                                </TableHead>
                                <TableHead className="w-10" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedPolicies.length === 0 ? (
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
                                paginatedPolicies.map(policy => (
                                    <TableRow key={policy.id}>
                                        <TableCell className="truncate">
                                            {policy.name}
                                        </TableCell>
                                        <TableCell className="truncate">
                                            {capitalize(String(policy.type ?? ""))}
                                        </TableCell>
                                        <TableCell className="truncate">
                                            {policy.description}
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
                                                        onClick={() =>
                                                            unAssign(policy)
                                                        }
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        {t("unAssignPolicy")}
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
                                <TableCell colSpan={COLUMN_COUNT} className="p-0">
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
            )}
            {errors.policies && <FormErrorText message={t("requiredPolicies")} />}
        </div>
    );
};
