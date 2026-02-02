/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/authorization/PermissionDetails.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type PolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import { DecisionStrategy } from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import {
    FormErrorText,
    HelpItem,
    SelectVariant,
    TextAreaControl,
    TextControl,
    useAlerts,
    useFetch
} from "../../../shared/keycloak-ui-shared";
import { AlertVariant } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Switch } from "@merge/ui/components/switch";
import { Label } from "@merge/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@merge/ui/components/radio-group";
import { DropdownMenuItem } from "@merge/ui/components/dropdown-menu";
import { useState } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { FormAccess } from "../../components/form/FormAccess";
import { KeycloakSpinner } from "../../../shared/keycloak-ui-shared";
import { ViewHeader } from "../../components/view-header/ViewHeader";
import { useAccess } from "../../context/access/Access";
import { toUpperCase } from "../../util";
import { useParams } from "../../utils/useParams";
import { toAuthorizationTab } from "../routes/AuthenticationTab";
import type { NewPermissionParams } from "../routes/NewPermission";
import {
    PermissionDetailsParams,
    toPermissionDetails
} from "../routes/PermissionDetails";
import { ResourcesPolicySelect } from "./ResourcesPolicySelect";
import { ScopeSelect } from "./ScopeSelect";

type FormFields = PolicyRepresentation & {
    resourceType: string;
};

export default function PermissionDetails() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();

    const form = useForm<FormFields>({
        mode: "onChange"
    });
    const {
        control,
        reset,
        formState: { errors },
        handleSubmit
    } = form;

    const navigate = useNavigate();
    const { id, realm, permissionType, permissionId, selectedId } = useParams<
        NewPermissionParams & PermissionDetailsParams
    >();

    const { addAlert, addError } = useAlerts();
    const [permission, setPermission] = useState<PolicyRepresentation>();
    const [applyToResourceTypeFlag, setApplyToResourceTypeFlag] = useState(false);
    const { hasAccess } = useAccess();

    const isDisabled = !hasAccess("manage-authorization");

    useFetch(
        async () => {
            if (!permissionId) {
                return {};
            }
            const [permission, resources, policies, scopes] = await Promise.all([
                adminClient.clients.findOnePermission({
                    id,
                    type: permissionType,
                    permissionId
                }),
                adminClient.clients.getAssociatedResources({
                    id,
                    permissionId
                }),
                adminClient.clients.getAssociatedPolicies({
                    id,
                    permissionId
                }),
                adminClient.clients.getAssociatedScopes({
                    id,
                    permissionId
                })
            ]);

            if (!permission) {
                throw new Error(t("notFound"));
            }

            return {
                permission,
                resources: resources.map(r => r._id),
                policies: policies.map(p => p.id!),
                scopes: scopes.map(s => s.id!)
            };
        },
        ({ permission, resources, policies, scopes }) => {
            reset({ ...permission, resources, policies, scopes });
            if (permission && "resourceType" in permission) {
                setApplyToResourceTypeFlag(
                    !!(permission as { resourceType: string }).resourceType
                );
            }
            setPermission({ ...permission, resources, policies });
        },
        []
    );

    const save = async (permission: PolicyRepresentation) => {
        try {
            if (permissionId) {
                await adminClient.clients.updatePermission(
                    { id, type: permissionType, permissionId },
                    permission
                );
            } else {
                const result = await adminClient.clients.createPermission(
                    { id, type: permissionType },
                    permission
                );
                setPermission(result);
                navigate(
                    toPermissionDetails({
                        realm,
                        id,
                        permissionType,
                        permissionId: result.id!
                    })
                );
            }
            addAlert(
                t((permissionId ? "update" : "create") + "PermissionSuccess"),
                AlertVariant.success
            );
        } catch (error) {
            addError("permissionSaveError", error);
        }
    };

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "deletePermission",
        messageKey: t("deletePermissionConfirm", {
            permission: permission?.name
        }),
        continueButtonVariant: "danger",
        continueButtonLabel: "confirm",
        onConfirm: async () => {
            try {
                await adminClient.clients.delPermission({
                    id,
                    type: permissionType,
                    permissionId: permissionId
                });
                addAlert(t("permissionDeletedSuccess"), AlertVariant.success);
                navigate(toAuthorizationTab({ realm, clientId: id, tab: "permissions" }));
            } catch (error) {
                addError("permissionDeletedError", error);
            }
        }
    });

    const resourcesIds = useWatch({
        control,
        name: "resources",
        defaultValue: []
    });

    if (!permission) {
        return <KeycloakSpinner />;
    }

    return (
        <>
            <DeleteConfirm />
            <ViewHeader
                titleKey={
                    permissionId
                        ? permission.name!
                        : `create${toUpperCase(permissionType)}BasedPermission`
                }
                dropdownItems={
                    permissionId
                        ? [
                              <DropdownMenuItem
                                  key="delete"
                                  data-testid="delete-resource"
                                  isDisabled={isDisabled}
                                  onClick={() => toggleDeleteDialog()}
                              >
                                  {t("delete")}
                              </DropdownMenuItem>
                          ]
                        : undefined
                }
            />
            <div className="p-6">
                <FormAccess
                    isHorizontal
                    role="manage-authorization"
                    onSubmit={handleSubmit(save)}
                >
                    <FormProvider {...form}>
                        <TextControl
                            name="name"
                            label={t("name")}
                            labelIcon={t("permissionName")}
                            rules={{
                                required: t("required")
                            }}
                        />
                        <TextAreaControl
                            name="description"
                            label={t("description")}
                            labelIcon={t("permissionDescription")}
                            rules={{
                                maxLength: {
                                    value: 255,
                                    message: t("maxLength", { length: 255 })
                                }
                            }}
                        />
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Label>{t("applyToResourceTypeFlag")}</Label>
                                <HelpItem
                                    helpText={t("applyToResourceTypeFlagHelp")}
                                    fieldLabelId="applyToResourceTypeFlag"
                                />
                            </div>
                            <Switch
                                id="applyToResourceTypeFlag"
                                checked={applyToResourceTypeFlag}
                                onCheckedChange={setApplyToResourceTypeFlag}
                                aria-label={t("applyToResourceTypeFlag")}
                            />
                        </div>
                        {applyToResourceTypeFlag ? (
                            <TextControl
                                name="resourceType"
                                label={t("resourceType")}
                                labelIcon={t("resourceTypeHelp")}
                                rules={{
                                    required: {
                                        value: permissionType === "scope" ? true : false,
                                        message: t("required")
                                    }
                                }}
                            />
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label>{t("resource")}</Label>
                                    <HelpItem
                                        helpText={t("permissionResources")}
                                        fieldLabelId="resources"
                                    />
                                </div>
                                <ResourcesPolicySelect
                                    name="resources"
                                    clientId={id}
                                    permissionId={permissionId}
                                    preSelected={
                                        permissionType === "scope"
                                            ? undefined
                                            : selectedId
                                    }
                                    variant={
                                        permissionType === "scope"
                                            ? SelectVariant.typeahead
                                            : SelectVariant.typeaheadMulti
                                    }
                                    isRequired={permissionType !== "scope"}
                                />
                                {errors.resources && (
                                    <FormErrorText message={t("required")} />
                                )}
                            </div>
                        )}
                        {permissionType === "scope" && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label>{t("authorizationScopes")}</Label>
                                    <HelpItem
                                        helpText={t("permissionScopesHelp")}
                                        fieldLabelId="scopesSelect"
                                    />
                                </div>
                                <ScopeSelect
                                    clientId={id}
                                    resourceId={resourcesIds?.[0]}
                                    preSelected={selectedId}
                                />
                                {errors.scopes && (
                                    <FormErrorText message={t("required")} />
                                )}
                            </div>
                        )}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Label>{t("policies")}</Label>
                                <HelpItem
                                    helpText={t("permissionPoliciesHelp")}
                                    fieldLabelId="policies"
                                />
                            </div>
                            <ResourcesPolicySelect
                                name="policies"
                                clientId={id}
                                permissionId={permissionId}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Label>{t("decisionStrategy")}</Label>
                                <HelpItem
                                    helpText={t("permissionDecisionStrategyHelp")}
                                    fieldLabelId="decisionStrategy"
                                />
                            </div>
                            <Controller
                                name="decisionStrategy"
                                data-testid="decisionStrategy"
                                defaultValue={DecisionStrategy.UNANIMOUS}
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={isDisabled}
                                        className="flex flex-col gap-2"
                                    >
                                        {Object.values(DecisionStrategy).map(strategy => (
                                            <div key={strategy} className="flex items-center gap-2" data-testid={strategy}>
                                                <RadioGroupItem value={strategy} id={strategy} />
                                                <Label htmlFor={strategy}>{t(`decisionStrategies.${strategy}`)}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                )}
                            />
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button
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
                                    to={toAuthorizationTab({
                                        realm,
                                        clientId: id,
                                        tab: "permissions"
                                    })}
                                >
                                    {t("cancel")}
                                </Link>
                            </Button>
                        </div>
                    </FormProvider>
                </FormAccess>
            </div>
        </>
    );
}
