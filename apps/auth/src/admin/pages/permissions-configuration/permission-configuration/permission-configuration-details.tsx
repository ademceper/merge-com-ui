import type PolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button, buttonVariants } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner
} from "../../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../../app/admin-client";
import { toPermissionsConfigurationTabs } from "../../../shared/lib/route-helpers";

import { useParams } from "../../../shared/lib/useParams";
import useSortedResourceTypes from "../../../shared/lib/useSortedResourceTypes";
import { useConfirmDialog } from "../../../shared/ui/confirm-dialog/confirm-dialog";
import { FormAccess } from "../../../shared/ui/form/form-access";
import { NameDescription } from "../../clients/authorization/policy/name-description";
import { ScopePicker } from "../../clients/authorization/scope-picker";
import { usePermissionDetail } from "../api/use-permission-detail";
import { useProvidersAndPolicies } from "../api/use-providers-and-policies";
import { ResourceType } from "../resource-types/resource-type";
import {
    type PermissionConfigurationDetailsParams,
    toPermissionConfigurationDetails
} from "../../../shared/lib/routes/permissions";
import { AssignedPolicies } from "./assigned-policies";

export default function PermissionConfigurationDetails() {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const { realm, permissionClientId, permissionId, resourceType } =
        useParams<PermissionConfigurationDetailsParams>();
    const navigate = useNavigate();
    const form = useForm();
    const { handleSubmit, reset } = form;
    const [permission, setPermission] = useState<PolicyRepresentation>();
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

    const { data: providersAndPolicies } = useProvidersAndPolicies(permissionClientId);
    const providers = providersAndPolicies?.providers;
    const policies = providersAndPolicies?.policies;

    const { data: permDetailData } = usePermissionDetail(
        permissionClientId,
        permissionId ?? ""
    );

    useEffect(() => {
        if (permDetailData) {
            const {
                permission: perm,
                resources,
                policies: assocPolicies,
                scopes
            } = permDetailData;
            const resourceIds = resources?.map(resource => resource.name!) || [];
            const policyIds = assocPolicies?.map(policy => policy.id!) || [];
            const scopeNames = scopes?.map(scope => scope.name) || [];

            reset({
                ...perm,
                resources: resourceIds!,
                policies: assocPolicies,
                scopes
            });

            setPermission({
                ...perm,
                resources: resourceIds!,
                policies: policyIds,
                scopes: scopeNames
            });
        }
    }, [permDetailData]);

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

            toast.success(
                t(permissionId ? "updatePermissionSuccess" : "createPermissionSuccess")
            );
        } catch (error) {
            toast.error(t("permissionSaveError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
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
                toast.error(
                    t("permissionDeletedError", { error: getErrorMessage(error) }),
                    { description: getErrorDescription(error) }
                );
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
                            <DropdownMenuTrigger
                                data-testid="action-dropdown"
                                className={buttonVariants()}
                            >
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
                        <Button className="mr-2" type="submit" data-testid="save">
                            {t("save")}
                        </Button>
                        <Button variant="link" data-testid="cancel" asChild>
                            <Link
                                to={
                                    toPermissionsConfigurationTabs({
                                        realm,
                                        permissionClientId,
                                        tab: "permissions"
                                    }) as string
                                }
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
