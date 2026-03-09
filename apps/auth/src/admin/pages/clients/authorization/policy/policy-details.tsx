import type PolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button, buttonVariants } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { Link, type LinkProps, useNavigate } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { type JSX, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage
} from "@/shared/keycloak-ui-shared";

const RouterLink = Link as ComponentType<LinkProps>;

import { KeycloakSpinner } from "@/shared/keycloak-ui-shared";
import { useUpdatePolicy, useCreatePolicy, useDeletePolicyMutation } from "../hooks/use-authorization-mutations";
import { toPermissionsConfigurationTabs } from "@/admin/shared/lib/route-helpers";
import {
    type PolicyDetailsParams,
    toAuthorizationTab,
    toPolicyDetails
} from "@/admin/shared/lib/routes/clients";
import type { NewPermissionPolicyDetailsParams } from "@/admin/shared/lib/routes/permissions";
import { toPermissionPolicyDetails } from "@/admin/shared/lib/routes/permissions";
import { useIsAdminPermissionsClient } from "@/admin/shared/lib/use-is-admin-permissions-client";
import { useParams } from "@/admin/shared/lib/use-params";
import { useConfirmDialog } from "@/admin/shared/ui/confirm-dialog/confirm-dialog";
import { FormAccess } from "@/admin/shared/ui/form/form-access";
import { usePolicyDetails as usePolicyDetailsQuery } from "../hooks/use-policy-details";
import { Aggregate } from "./aggregate";
import { Client } from "./client";
import { ClientScope, type RequiredIdValue } from "./client-scope";
import { Group, type GroupValue } from "./group";
import { JavaScript } from "./java-script";
import { LogicSelector } from "./logic-selector";
import { NameDescription } from "./name-description";
import { Regex } from "./regex";
import { Role } from "./role";
import { Time } from "./time";
import { User } from "./user";

type Policy = Omit<PolicyRepresentation, "roles"> & {
    groups?: GroupValue[];
    clientScopes?: RequiredIdValue[];
    roles?: RequiredIdValue[];
};

const COMPONENTS: {
    [index: string]: () => JSX.Element;
} = {
    aggregate: Aggregate,
    client: Client,
    user: User,
    "client-scope": ClientScope,
    group: Group,
    regex: Regex,
    role: Role,
    time: Time,
    js: JavaScript
} as const;

export const isValidComponentType = (value: string) => value in COMPONENTS;

export function PolicyDetails() {
    const { t } = useTranslation();
    const { id, realm, policyId, policyType } = useParams<PolicyDetailsParams>();
    const { permissionClientId } = useParams<NewPermissionPolicyDetailsParams>();
    const navigate = useNavigate();
    const { mutateAsync: updatePolicyMutation } = useUpdatePolicy();
    const { mutateAsync: createPolicyMutation } = useCreatePolicy();
    const { mutateAsync: deletePolicyMutation } = useDeletePolicyMutation();
    const form = useForm();
    const { reset, handleSubmit } = form;
    const [policy, setPolicy] = useState<PolicyRepresentation>();
    const isDisabled = policyType === "js";
    const isAdminPermissionsClient = useIsAdminPermissionsClient(permissionClientId);

    const { data: policyDetailsData } = usePolicyDetailsQuery(
        permissionClientId ?? id,
        policyType!,
        policyId
    );

    useEffect(() => {
        if (policyDetailsData) {
            const { policy: pol, policies } = policyDetailsData as {
                policy?: PolicyRepresentation;
                policies?: (string | undefined)[];
            };
            reset({ ...pol, policies });
            setPolicy(pol);
        }
    }, [policyDetailsData]);

    const onSubmitPolicy = async (policy: Policy) => {
        policy.groups = policy.groups?.filter(g => g.id);
        policy.clientScopes = policy.clientScopes?.filter(c => c.id);
        policy.roles = policy.roles
            ?.filter(r => r.id)
            .map(r => ({ ...r, required: r.required || false }));

        const clientId = isAdminPermissionsClient ? permissionClientId : id;
        const navigateTo = isAdminPermissionsClient
            ? toPermissionPolicyDetails
            : toPolicyDetails;

        try {
            if (policyId) {
                await updatePolicyMutation({
                    clientId: clientId!,
                    type: policyType!,
                    policyId,
                    policy
                });
            } else {
                const result = await createPolicyMutation({
                    clientId: clientId!,
                    type: policyType!,
                    policy
                });

                navigate({
                    to: navigateTo({
                        realm: realm!,
                        id: clientId!,
                        permissionClientId: clientId!,
                        policyId: result.id!,
                        policyType: result.type!
                    }) as string
                });
            }
            toast.success(t(`${policyId ? "update" : "create"}PolicySuccess`));
        } catch (error) {
            toast.error(t("policySaveError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "deletePolicy",
        messageKey: "deletePolicyConfirm",
        continueButtonLabel: "confirm",
        onConfirm: async () => {
            try {
                await deletePolicyMutation({
                    clientId: isAdminPermissionsClient ? permissionClientId : id,
                    policyId
                });
                toast.success(t("policyDeletedSuccess"));
                navigate({
                    to: (isAdminPermissionsClient
                        ? toPermissionsConfigurationTabs({
                              realm: realm!,
                              permissionClientId,
                              tab: "policies"
                          })
                        : toAuthorizationTab({
                              realm,
                              clientId: id,
                              tab: "policies"
                          })) as string
                });
            } catch (error) {
                toast.error(t("policyDeletedError", { error: getErrorMessage(error) }), {
                    description: getErrorDescription(error)
                });
            }
        }
    });

    if (policyId && !policy) {
        return <KeycloakSpinner />;
    }

    function getComponentType() {
        return isValidComponentType(policyType) ? COMPONENTS[policyType] : COMPONENTS.js;
    }

    const ComponentType = getComponentType();

    return (
        <>
            <DeleteConfirm />
            {policyId && (
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
                                    data-testid="delete-policy"
                                    onClick={() => toggleDeleteDialog()}
                                >
                                    {t("delete")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            )}
            <section className="py-6 bg-muted/30">
                <FormAccess
                    isHorizontal
                    onSubmit={handleSubmit(policy => onSubmitPolicy(policy))}
                    role="anyone" // if you get this far it means you have access
                >
                    <FormProvider {...form}>
                        <NameDescription isDisabled={isDisabled} />
                        <ComponentType />
                        <LogicSelector isDisabled={isDisabled} />
                    </FormProvider>
                    <div className="flex gap-2 mt-4">
                        <Button disabled={isDisabled} type="submit" data-testid="save">
                            {t("save")}
                        </Button>
                        <Button variant="ghost" data-testid="cancel" asChild>
                            <RouterLink
                                to={
                                    (isAdminPermissionsClient
                                        ? toPermissionsConfigurationTabs({
                                              realm: realm!,
                                              permissionClientId,
                                              tab: "policies"
                                          })
                                        : toAuthorizationTab({
                                              realm,
                                              clientId: id,
                                              tab: "policies"
                                          })) as string
                                }
                            >
                                {t("cancel")}
                            </RouterLink>
                        </Button>
                    </div>
                </FormAccess>
            </section>
        </>
    );
}
