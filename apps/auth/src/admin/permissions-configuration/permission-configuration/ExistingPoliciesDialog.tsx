/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/permissions-configuration/permission-configuration/ExistingPoliciesDialog.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import PolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import { PolicyQuery } from "@keycloak/keycloak-admin-client/lib/resources/clients";
import {
    KeycloakDataTable,
    ListEmptyState,
    useFetch
} from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
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
    const [isFilterTypeDropdownOpen, toggleIsFilterTypeDropdownOpen] = useToggle();
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

    const loader = async (first?: number, max?: number, search?: string) => {
        const params: PolicyQuery = {
            id: permissionClientId!,
            permission: "false",
            first,
            max
        };

        if (search) {
            params.name = search;
        }

        if (filterType) {
            params.type = filterType;
        }

        return (await adminClient.clients.listPolicies(params)) || [];
    };

    return (
        <Dialog open={open} onOpenChange={toggleDialog}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{t("assignExistingPolicies")}</DialogTitle>
                </DialogHeader>
                <KeycloakDataTable
                    key={filterType}
                    loader={loader}
                    ariaLabelKey={t("chooseAPolicyType")}
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
                    canSelectAll
                    onSelect={selectedRows => setRows(selectedRows)}
                    columns={[
                        { name: "name" },
                        {
                            name: "type",
                            cellFormatters: [capitalizeFirstLetterFormatter()]
                        },
                        { name: "description" }
                    ]}
                    emptyState={
                        <ListEmptyState
                            message={t("emptyAssignExistingPolicies")}
                            instructions={t("emptyAssignExistingPoliciesInstructions")}
                        />
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
