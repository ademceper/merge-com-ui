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
import { Label } from "@merge-rd/ui/components/label";
import { CaretDown, Funnel } from "@phosphor-icons/react";
import { capitalize, sortBy } from "lodash-es";
import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { DataTable, DataTableRowActions } from "@/admin/shared/ui/data-table";
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

    const filteredPolicies = filterType
        ? selectedPolicies.filter(policy => capitalize(policy.type) === filterType)
        : selectedPolicies;

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
                <DataTable<PolicyRepresentation>
                    columns={[
                        { accessorKey: "name", header: t("name") },
                        {
                            accessorKey: "type",
                            header: t("type"),
                            cell: ({ getValue }) => capitalize(String(getValue() ?? ""))
                        },
                        { accessorKey: "description", header: t("description") },
                        {
                            id: "actions",
                            cell: ({ row }) => (
                                <DataTableRowActions row={row}>
                                    <DropdownMenuItem
                                        onClick={() => unAssign(row.original)}
                                        className="text-destructive"
                                    >
                                        {t("unAssignPolicy")}
                                    </DropdownMenuItem>
                                </DataTableRowActions>
                            )
                        }
                    ]}
                    data={filteredPolicies}
                    searchColumnId="name"
                    searchPlaceholder={t("searchClientAuthorizationPolicy")}
                    emptyContent={
                        <Empty className="py-12">
                            <EmptyHeader>
                                <EmptyTitle>
                                    {t("emptyAssignExistingPolicies")}
                                </EmptyTitle>
                            </EmptyHeader>
                            <EmptyContent>
                                <EmptyDescription>
                                    {t("emptyAssignExistingPoliciesInstructions")}
                                </EmptyDescription>
                            </EmptyContent>
                        </Empty>
                    }
                    emptyMessage={t("emptyAssignExistingPolicies")}
                    toolbar={
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    data-testid="filter-type-dropdown-existingPolicies"
                                >
                                    <Funnel className="size-4 mr-1" />
                                    {filterType ? capitalize(filterType) : t("allTypes")}
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
                    }
                />
            )}
            {errors.policies && <FormErrorText message={t("requiredPolicies")} />}
        </div>
    );
};
