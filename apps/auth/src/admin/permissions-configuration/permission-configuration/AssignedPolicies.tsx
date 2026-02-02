/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/permissions-configuration/permission-configuration/AssignedPolicies.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import PolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import {
    Action,
    FormErrorText,
    HelpItem,
    KeycloakDataTable,
    ListEmptyState,
    useFetch
} from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Label } from "@merge/ui/components/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@merge/ui/components/dropdown-menu";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { NewPermissionPolicyDialog } from "./NewPermissionPolicyDialog";
import PolicyProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyProviderRepresentation";
import { ExistingPoliciesDialog } from "./ExistingPoliciesDialog";
import { Funnel, CaretDown } from "@phosphor-icons/react";
import { capitalize, sortBy } from "lodash-es";
import useToggle from "../../utils/useToggle";
type IRowData = { data: any };

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
    const { adminClient } = useAdminClient();
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
    const [isFilterTypeDropdownOpen, toggleIsFilterTypeDropdownOpen] = useToggle();

    useFetch(
        () => {
            if (values && values.length > 0)
                return Promise.all(
                    values.map(p =>
                        adminClient.clients.findOnePolicyWithType({
                            id: permissionClientId,
                            type: p.type!,
                            policyId: p.id
                        })
                    )
                );
            return Promise.resolve([]);
        },
        policies => {
            const filteredPolicy = policies.filter(p => p) as [];
            setSelectedPolicies(filteredPolicy);
        },
        [policies]
    );

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
                <KeycloakDataTable
                    loader={filteredPolicies}
                    ariaLabelKey={t("policies")}
                    searchPlaceholderKey={t("searchClientAuthorizationPolicy")}
                    isSearching={true}
                    searchTypeComponent={
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
                    actionResolver={(rowData: IRowData) => [
                        {
                            title: t("unAssignPolicy"),
                            onClick: () => unAssign(rowData.data as PolicyRepresentation)
                        } as Action<PolicyRepresentation>
                    ]}
                    columns={[
                        { name: "name", displayKey: t("name") },
                        {
                            name: "type",
                            displayKey: t("type"),
                            cellFormatters: [value => capitalize(String(value || ""))]
                        },
                        { name: "description", displayKey: t("description") }
                    ]}
                    emptyState={
                        <ListEmptyState
                            message={t("emptyAssignExistingPolicies")}
                            instructions={t("emptyAssignExistingPoliciesInstructions")}
                        />
                    }
                />
            )}
            {errors.policies && <FormErrorText message={t("requiredPolicies")} />}
        </div>
    );
};
