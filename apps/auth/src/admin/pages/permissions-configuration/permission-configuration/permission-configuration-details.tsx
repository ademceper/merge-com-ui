import PolicyProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyProviderRepresentation";
import { getErrorDescription, getErrorMessage, useFetch } from "../../../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import { Button, buttonVariants } from "@merge-rd/ui/components/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@merge-rd/ui/components/dropdown-menu";
import { useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "@merge-rd/i18n";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAdminClient } from "../../../app/admin-client";
import { useConfirmDialog } from "../../../shared/ui/confirm-dialog/confirm-dialog";
import { FormAccess } from "../../../shared/ui/form/form-access";
import { KeycloakSpinner } from "../../../../shared/keycloak-ui-shared";

import { useParams } from "../../../shared/lib/useParams";
import {
    PermissionConfigurationDetailsParams,
    toPermissionConfigurationDetails
} from "../routes/permission-configuration-details";
import { toPermissionsConfigurationTabs } from "../routes/permissions-configuration-tabs";
import PolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import { AssignedPolicies } from "./assigned-policies";
import { ScopePicker } from "../../clients/authorization/scope-picker";
import { ResourceType } from "../resource-types/resource-type";
import { sortBy } from "lodash-es";
import { NameDescription } from "../../clients/authorization/policy/name-description";
import useSortedResourceTypes from "../../../shared/lib/useSortedResourceTypes";

export default function PermissionConfigurationDetails() {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const { realm, permissionClientId, permissionId, resourceType } =
        useParams<PermissionConfigurationDetailsParams>();
    const navigate = useNavigate();
    const form = useForm();
    const { handleSubmit, reset } = form;
const [permission, setPermission] = useState<PolicyRepresentation>();
    const [providers, setProviders] = useState<PolicyProviderRepresentation[]>();
    const [policies, setPolicies] = useState<PolicyRepresentation[]>();
    const resourceTypes = useSortedResourceTypes({
        clientId: permissionClientId
    });

    const resourceTypeScopes = useMemo(
        () =>
            resourceTypes
                .filter(({ type }) => type === resourceType)
                .flatMap(({ scopes = [] }) => scopes)
                .map(scope => scope || ""),
        [resourceTypes, resourceType]
    );

    useFetch(
        async () => {
            if (!permissionClientId) {
                return {};
            }

            const [providers, policies] = await Promise.all([
                adminClient.clients.listPolicyProviders({ id: permissionClientId }),
                adminClient.clients.listPolicies({
                    id: permissionClientId,
                    permission: "false"
                })
            ]);

            return { providers, policies };
        },
        ({ providers, policies }) => {
            const filteredProviders = providers?.filter(
                p => p.type !== "resource" && p.type !== "scope"
            );

            setProviders(
                sortBy(
                    filteredProviders,
                    (provider: PolicyProviderRepresentation) => provider.type
                )
            );
            setPolicies(policies || []);
        },
        [permissionClientId]
    );

    useFetch(
        async () => {
            if (!permissionId) {
                return {};
            }
            const [permission, resources, policies, scopes] = await Promise.all([
                adminClient.clients.findOnePermission({
                    id: permissionClientId,
                    type: "scope",
                    permissionId
                }),
                adminClient.clients.getAssociatedResources({
                    id: permissionClientId,
                    permissionId
                }),
                adminClient.clients.getAssociatedPolicies({
                    id: permissionClientId,
                    permissionId
                }),
                adminClient.clients.getAssociatedScopes({
                    id: permissionClientId,
                    permissionId
                })
            ]);

            if (!permission) {
                throw new Error(t("notFound"));
            }

            return {
                permission,
                resources,
                policies,
                scopes
            };
        },
        ({ permission, resources, policies, scopes }) => {
            const resourceIds = resources?.map(resource => resource.name!) || [];
            const policyIds = policies?.map(policy => policy.id!) || [];
            const scopeNames = scopes?.map(scope => scope.name) || [];

            reset({
                ...permission,
                resources: resourceIds!,
                policies,
                scopes
            });

            setPermission({
                ...permission,
                resources: resourceIds!,
                policies: policyIds,
                scopes: scopeNames
            });
        },
        [permissionClientId, permissionId]
    );

    const save = async (permission: PolicyRepresentation) => {
        try {
            const newPermission = {
                ...permission,
                policies: permission.policies?.map((policy: any) => policy.id),
                scopes: permission.scopes?.map((scope: any) => scope.name),
                resourceType: resourceType
            };

            if (permissionId) {
                await adminClient.clients.updatePermission(
                    { id: permissionClientId, type: "scope", permissionId },
                    newPermission
                );
            } else {
                const result = await adminClient.clients.createPermission(
                    { id: permissionClientId, type: "scope" },
                    newPermission
                );
                setPermission(result);
                navigate({
                    to: toPermissionConfigurationDetails({
                        realm,
                        permissionClientId: permissionClientId,
                        permissionId: result.id!,
                        resourceType
                    }) as string
                });
            }

            toast.success(t(permissionId ? "updatePermissionSuccess" : "createPermissionSuccess"));
        } catch (error) {
            toast.error(t("permissionSaveError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "deletePermission",
        messageKey: t("deleteAdminPermissionConfirm", {
            permission: permission?.name
        }),
        continueButtonVariant: "destructive",
        continueButtonLabel: "confirm",
        onConfirm: async () => {
            try {
                await adminClient.clients.delPermission({
                    id: permissionClientId!,
                    type: "scope",
                    permissionId: permissionId
                });
                toast.success(t("permissionDeletedSuccess"));
                navigate({
                    to: toPermissionsConfigurationTabs({
                        realm,
                        permissionClientId,
                        tab: "permissions"
                    }) as string
                });
            } catch (error) {
                toast.error(t("permissionDeletedError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        }
    });

    if (!permission) {
        return <KeycloakSpinner />;
    }

    return (
        <>
            <DeleteConfirm />
            {permissionId && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2" />
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger data-testid="action-dropdown" className={buttonVariants()}>
                                {t("action")}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    key="delete"
                                    data-testid="delete-permission"
                                    onClick={() => toggleDeleteDialog()}
                                >
                                    {t("delete")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            )}
            <div className="p-6">
                <FormAccess isHorizontal onSubmit={handleSubmit(save)} role="anyone">
                    <FormProvider {...form}>
                        <NameDescription clientId={permissionClientId} />
                        <ScopePicker
                            clientId={permissionClientId}
                            resourceTypeScopes={resourceTypeScopes ?? []}
                        />
                        <ResourceType resourceType={resourceType} />
                        <AssignedPolicies
                            permissionClientId={permissionClientId}
                            providers={providers!}
                            policies={policies!}
                            resourceType={resourceType}
                        />
                    </FormProvider>
                    <div className="flex gap-2 mt-4">
                        <Button
                            className="mr-2"
                            type="submit"
                            data-testid="save"
                        >
                            {t("save")}
                        </Button>
                        <Button
                            variant="link"
                            data-testid="cancel"
                            asChild
                        >
                            <Link
                                to={toPermissionsConfigurationTabs({
                                    realm,
                                    permissionClientId,
                                    tab: "permissions"
                                }) as string}
                            >
                                {t("cancel")}
                            </Link>
                        </Button>
                    </div>
                </FormAccess>
            </div>
        </>
    );
}
