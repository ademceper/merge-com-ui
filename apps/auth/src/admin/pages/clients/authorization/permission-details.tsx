import type PolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import { DecisionStrategy } from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import { getErrorDescription, getErrorMessage, FormErrorText,
    HelpItem,
    SelectVariant,
    TextAreaControl,
    TextControl,
    useFetch } from "../../../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import { Button, buttonVariants } from "@merge-rd/ui/components/button";
import { Switch } from "@merge-rd/ui/components/switch";
import { Label } from "@merge-rd/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@merge-rd/ui/components/radio-group";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@merge-rd/ui/components/dropdown-menu";
import { useState } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../../../app/admin-client";
import { useConfirmDialog } from "../../../shared/ui/confirm-dialog/confirm-dialog";
import { FormAccess } from "../../../shared/ui/form/form-access";
import { KeycloakSpinner } from "../../../../shared/keycloak-ui-shared";
import { useAccess } from "../../../app/providers/access/access";
import { toUpperCase } from "../../../shared/lib/util";
import { useParams } from "../../../shared/lib/useParams";
import { toAuthorizationTab } from "../routes/authentication-tab";
import type { NewPermissionParams } from "../routes/new-permission";
import {
    PermissionDetailsParams,
    toPermissionDetails
} from "../routes/permission-details";
import { ResourcesPolicySelect } from "./resources-policy-select";
import { ScopeSelect } from "./scope-select";

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
            toast.success(
                t((permissionId ? "update" : "create") + "PermissionSuccess")
            );
        } catch (error) {
            toast.error(t("permissionSaveError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "deletePermission",
        messageKey: t("deletePermissionConfirm", {
            permission: permission?.name
        }),
        continueButtonVariant: "destructive",
        continueButtonLabel: "confirm",
        onConfirm: async () => {
            try {
                await adminClient.clients.delPermission({
                    id,
                    type: permissionType,
                    permissionId: permissionId
                });
                toast.success(t("permissionDeletedSuccess"));
                navigate(toAuthorizationTab({ realm, clientId: id, tab: "permissions" }));
            } catch (error) {
                toast.error(t("permissionDeletedError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
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
                                    data-testid="delete-resource"
                                    disabled={isDisabled}
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
