/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/permissions-configuration/permission-configuration/PermissionsConfigurationTab.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type PolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import ResourceRepresentation from "@keycloak/keycloak-admin-client/lib/defs/resourceRepresentation";
import ScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/scopeRepresentation";
import {
    AlertVariant,
    KeycloakSpinner,
    ListEmptyState,
    PaginatingTableToolbar,
    useAlerts,
    useFetch
} from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@merge/ui/components/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@merge/ui/components/table";
import { CaretDown, CaretRight, DotsThreeVertical } from "@phosphor-icons/react";
import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { useRealm } from "../../context/realm-context/RealmContext";
import useSortedResourceTypes from "../../utils/useSortedResourceTypes";
import useToggle from "../../utils/useToggle";
import { AuthorizationScopesDetails } from "../permission-configuration/AuthorizationScopesDetails";
import { SearchDropdown, SearchForm } from "../resource-types/SearchDropdown";
import { toCreatePermissionConfiguration } from "../routes/NewPermissionConfiguration";
import { toPermissionConfigurationDetails } from "../routes/PermissionConfigurationDetails";
import { NewPermissionConfigurationDialog } from "./NewPermissionConfigurationDialog";

type PermissionsConfigurationProps = {
    clientId: string;
};

type ExpandablePolicyRepresentation = PolicyRepresentation & {
    policies?: PolicyRepresentation[];
    resources?: ResourceRepresentation[];
    scopes?: ScopeRepresentation[];
    isExpanded: boolean;
};

export const PermissionsConfigurationTab = ({
    clientId
}: PermissionsConfigurationProps) => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { addAlert, addError } = useAlerts();
    const { realm } = useRealm();
    const [permissions, setPermissions] = useState<ExpandablePolicyRepresentation[]>();
    const [selectedPermission, setSelectedPermission] = useState<PolicyRepresentation>();
    const [search, setSearch] = useState<SearchForm>({});
    const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);
    const [max, setMax] = useState(10);
    const [first, setFirst] = useState(0);
    const [newDialog, toggleDialog] = useToggle();
    const resourceTypes = useSortedResourceTypes({ clientId });

    useFetch(
        async () => {
            const permissions = await adminClient.clients.listPermissionScope({
                first,
                max: max + 1,
                id: clientId,
                ...search
            });

            const processedPermissions = await Promise.all(
                (permissions || []).map(async permission => {
                    const policies = await adminClient.clients.getAssociatedPolicies({
                        id: clientId,
                        permissionId: permission.id!
                    });

                    const scopes = await adminClient.clients.getAssociatedScopes({
                        id: clientId,
                        permissionId: permission.id!
                    });

                    const resources = await adminClient.clients.getAssociatedResources({
                        id: clientId,
                        permissionId: permission.id!
                    });

                    return {
                        ...permission,
                        policies,
                        scopes,
                        resources,
                        isExpanded: false
                    };
                })
            );

            return processedPermissions;
        },
        permissions => {
            setPermissions(permissions as any[]);
        },
        [key, search, first, max]
    );

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "deletePermission",
        messageKey: t("deleteAdminPermissionConfirm", {
            permission: selectedPermission?.name
        }),
        continueButtonVariant: "destructive",
        continueButtonLabel: "confirm",
        onConfirm: async () => {
            try {
                await adminClient.clients.delPermission({
                    id: clientId,
                    type: selectedPermission?.type!,
                    permissionId: selectedPermission?.id!
                });
                addAlert(t("permissionDeletedSuccess"), AlertVariant.success);
                refresh();
            } catch (error) {
                addError("permissionDeletedError", error);
            }
        }
    });

    if (!permissions) {
        return <KeycloakSpinner />;
    }

    const noData = permissions.length === 0;
    const searching = Object.keys(search).length !== 0;
    return (
        <div className="p-0 bg-muted/30">
            <DeleteConfirm />
            {(!noData || searching) && (
                <>
                    {newDialog && (
                        <NewPermissionConfigurationDialog
                            resourceTypes={resourceTypes}
                            onSelect={resourceType =>
                                navigate(
                                    toCreatePermissionConfiguration({
                                        realm,
                                        permissionClientId: clientId,
                                        resourceType: resourceType.type!
                                    })
                                )
                            }
                            toggleDialog={toggleDialog}
                        />
                    )}
                    <PaginatingTableToolbar
                        count={permissions.length}
                        first={first}
                        max={max}
                        onNextClick={setFirst}
                        onPreviousClick={setFirst}
                        onPerPageSelect={(first, max) => {
                            setFirst(first);
                            setMax(max);
                        }}
                        toolbarItem={
                            <>
                                <SearchDropdown
                                    types={resourceTypes}
                                    search={search}
                                    onSearch={setSearch}
                                />
                                <Button
                                    data-testid="createScopeBasedPermissionBtn"
                                    key="confirm"
                                    variant="default"
                                    onClick={toggleDialog}
                                >
                                    {t("createPermission")}
                                </Button>
                            </>
                        }
                    >
                        {!noData && (
                            <Table
                                aria-label={t("permissions")}
                                className="text-sm"
                            >
                                <TableHeader>
                                    <TableRow>
                                        <TableHead aria-hidden="true" className="w-10" />
                                        <TableHead>{t("adminPermissionName")}</TableHead>
                                        <TableHead>{t("resourceType")}</TableHead>
                                        <TableHead>{t("authorizationScopes")}</TableHead>
                                        <TableHead>{t("description")}</TableHead>
                                        <TableHead aria-hidden="true" className="w-10" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {permissions.map((permission, rowIndex) => (
                                        <Fragment key={permission.id}>
                                            <TableRow>
                                                <TableCell className="w-10">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        aria-expanded={permission.isExpanded}
                                                        onClick={() => {
                                                            const rows = permissions.map(
                                                                (p, index) =>
                                                                    index === rowIndex
                                                                        ? {
                                                                              ...p,
                                                                              isExpanded:
                                                                                  !p.isExpanded
                                                                          }
                                                                        : p
                                                            );
                                                            setPermissions(rows);
                                                        }}
                                                    >
                                                        {permission.isExpanded ? (
                                                            <CaretDown className="size-4" />
                                                        ) : (
                                                            <CaretRight className="size-4" />
                                                        )}
                                                    </Button>
                                                </TableCell>
                                                <TableCell
                                                    data-testid={`name-column-${permission.name}`}
                                                >
                                                    <Link
                                                        to={toPermissionConfigurationDetails({
                                                            realm,
                                                            permissionClientId: clientId,
                                                            permissionId: permission.id!,
                                                            resourceType:
                                                                permission.resourceType!
                                                        })}
                                                    >
                                                        {permission.name}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{permission.resourceType}</TableCell>
                                                <TableCell>
                                                    <AuthorizationScopesDetails
                                                        row={{
                                                            resourceType:
                                                                permission.resourceType || "",
                                                            associatedScopes:
                                                                permission.scopes?.map(
                                                                    (
                                                                        scope: ScopeRepresentation
                                                                    ) => ({
                                                                        name: scope.name || ""
                                                                    })
                                                                )
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>{permission.description || "—"}</TableCell>
                                                <TableCell className="w-10">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                aria-label={t("delete")}
                                                            >
                                                                <DotsThreeVertical className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setSelectedPermission(
                                                                        permission
                                                                    );
                                                                    toggleDeleteDialog();
                                                                }}
                                                            >
                                                                {t("delete")}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                            {permission.isExpanded && (
                                                <TableRow key={`child-${permission.id}`}>
                                                    <TableCell />
                                                    <TableCell
                                                        colSpan={5}
                                                        className="bg-muted/30 p-4"
                                                    >
                                                        <div className="space-y-2">
                                                            <div className="font-medium">
                                                                {t("resources")}
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {permission.resources &&
                                                                permission.resources?.length > 0
                                                                    ? permission.resources.map(
                                                                          (
                                                                              resource: ResourceRepresentation,
                                                                              index: number
                                                                          ) => (
                                                                              <span
                                                                                  key={index}
                                                                                  className="ml-2"
                                                                              >
                                                                                  {resource.displayName ||
                                                                                      resource.name}
                                                                              </span>
                                                                          )
                                                                      )
                                                                    : (
                                                                        <span className="ml-2">
                                                                            {t("allResources")}
                                                                        </span>
                                                                    )}
                                                            </div>
                                                            <div className="font-medium">
                                                                {t("assignedPolicies")}
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {permission.policies?.map(
                                                                    (
                                                                        policy: PolicyRepresentation,
                                                                        index: number
                                                                    ) => (
                                                                        <span
                                                                            key={index}
                                                                            className="ml-2"
                                                                        >
                                                                            {policy.name}
                                                                        </span>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </PaginatingTableToolbar>
                </>
            )}
            {noData && !searching && (
                <>
                    {newDialog && (
                        <NewPermissionConfigurationDialog
                            resourceTypes={resourceTypes}
                            onSelect={resourceType =>
                                navigate(
                                    toCreatePermissionConfiguration({
                                        realm,
                                        permissionClientId: clientId,
                                        resourceType: resourceType.type!
                                    })
                                )
                            }
                            toggleDialog={toggleDialog}
                        />
                    )}
                    <ListEmptyState
                        message={t("emptyPermissions")}
                        instructions={t("emptyPermissionsInstructions")}
                        primaryActionText={t("createPermission")}
                        onPrimaryAction={toggleDialog}
                    />
                </>
            )}
            {noData && searching && (
                <ListEmptyState
                    isSearchVariant
                    message={t("noSearchResults")}
                    instructions={t("noPermissionSearchResultsInstructions")}
                />
            )}
        </div>
    );
};
