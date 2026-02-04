import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import type EvaluationResultRepresentation from "@keycloak/keycloak-admin-client/lib/defs/evaluationResultRepresentation";
import type PolicyEvaluationResponse from "@keycloak/keycloak-admin-client/lib/defs/policyEvaluationResponse";
import type ResourceEvaluation from "@keycloak/keycloak-admin-client/lib/defs/resourceEvaluation";
import type ResourceRepresentation from "@keycloak/keycloak-admin-client/lib/defs/resourceRepresentation";
import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import type ScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/scopeRepresentation";
import { getErrorDescription, getErrorMessage, HelpItem,
    SelectControl,
    TextControl,
    useFetch } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { Switch } from "@merge/ui/components/switch";
import { Label } from "@merge/ui/components/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@merge/ui/components/collapsible";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ForbiddenSection } from "../../ForbiddenSection";
import { useAdminClient } from "../../admin-client";
import { ClientSelect } from "../../components/client/ClientSelect";
import { FormAccess } from "../../components/form/FormAccess";
import {
    KeyValueType,
    keyValueToArray
} from "../../components/key-value-form/key-value-convert";
import { UserSelect } from "../../components/users/UserSelect";
import { useAccess } from "../../context/access/Access";
import { useRealm } from "../../context/realm-context/RealmContext";
import { FormFields } from "../ClientDetails";
import { defaultContextAttributes } from "../utils";
import { KeyBasedAttributeInput } from "./KeyBasedAttributeInput";
import { Results } from "./evaluate/Results";

interface EvaluateFormInputs extends Omit<ResourceEvaluation, "context" | "resources"> {
    alias: string;
    authScopes: string[];
    context: {
        attributes: Record<string, string>[];
    };
    resources?: Record<string, string>[];
    client: FormFields;
    user: string[];
}

export type AttributeType = {
    key: string;
    name: string;
    custom?: boolean;
    values?: {
        [key: string]: string;
    }[];
};

type ClientSettingsProps = {
    client: ClientRepresentation;
    save: () => void;
};

export type AttributeForm = Omit<EvaluateFormInputs, "context" | "resources"> & {
    context: {
        attributes?: KeyValueType[];
    };
    resources?: KeyValueType[];
};

type Props = ClientSettingsProps & EvaluationResultRepresentation;

export const AuthorizationEvaluate = (props: Props) => {
    const { hasAccess } = useAccess();

    if (!hasAccess("view-users")) {
        return <ForbiddenSection permissionNeeded="view-users" />;
    }

    return <AuthorizationEvaluateContent {...props} />;
};

const AuthorizationEvaluateContent = ({ client }: Props) => {
    const { adminClient } = useAdminClient();

    const form = useForm<EvaluateFormInputs>({ mode: "onChange" });
    const {
        reset,
        trigger,
        formState: { isValid }
    } = form;
    const { t } = useTranslation();
    const realm = useRealm();
    const [isExpanded, setIsExpanded] = useState(false);
    const [applyToResourceType, setApplyToResourceType] = useState(false);
    const [resources, setResources] = useState<ResourceRepresentation[]>([]);
    const [scopes, setScopes] = useState<ScopeRepresentation[]>([]);
    const [evaluateResult, setEvaluateResult] = useState<PolicyEvaluationResponse>();
    const [clientRoles, setClientRoles] = useState<RoleRepresentation[]>([]);

    useFetch(
        () => adminClient.roles.find(),
        roles => {
            setClientRoles(roles);
        },
        []
    );

    useFetch(
        () =>
            Promise.all([
                adminClient.clients.listResources({
                    id: client.id!
                }),
                adminClient.clients.listAllScopes({
                    id: client.id!
                })
            ]),
        ([resources, scopes]) => {
            setResources(resources);
            setScopes(scopes);
        },
        []
    );

    const evaluate = async () => {
        if (!(await trigger())) {
            return;
        }
        const formValues = form.getValues();
        const keys = keyValueToArray(formValues.resources as KeyValueType[]);
        const resEval: ResourceEvaluation = {
            roleIds: formValues.roleIds ?? [],
            clientId: formValues.client.id!,
            userId: formValues.user![0],
            resources: resources
                .filter(resource => Object.keys(keys).includes(resource.name!))
                .map(r => ({
                    ...r,
                    scopes: r.scopes?.filter(s =>
                        Object.values(keys)
                            .flatMap(v => v)
                            .includes(s.name!)
                    )
                })),
            entitlements: false,
            context: {
                attributes: Object.fromEntries(
                    formValues.context.attributes
                        .filter(item => item.key || item.value !== "")
                        .map(({ key, value }) => [key, value])
                )
            }
        };

        try {
            const evaluation = await adminClient.clients.evaluateResource(
                { id: client.id!, realm: realm.realm },
                resEval
            );

            setEvaluateResult(evaluation);
        } catch (error) {
            toast.error(t("evaluateError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    if (evaluateResult) {
        return (
            <Results
                evaluateResult={evaluateResult}
                refresh={evaluate}
                back={() => setEvaluateResult(undefined)}
            />
        );
    }

    return (
        <div className="p-6">
            <FormProvider {...form}>
                <div className="border rounded-lg">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold">{t("identityInformation")}</h2>
                    </div>
                    <div className="p-4">
                        <FormAccess isHorizontal role="view-clients">
                            <ClientSelect
                                name="client"
                                label="client"
                                helpText={"clientHelp"}
                                defaultValue={client.clientId}
                            />
                            <UserSelect
                                name="user"
                                label="users"
                                helpText={t("selectUser")}
                                defaultValue={[]}
                                variant="typeahead"
                                isRequired
                            />
                            <SelectControl
                                name="roleIds"
                                label={t("roles")}
                                labelIcon={t("rolesHelp")}
                                variant="typeaheadMulti"
                                placeholderText={t("selectARole")}
                                controller={{
                                    defaultValue: [],
                                    rules: {
                                        required: true
                                    }
                                }}
                                options={clientRoles.map(role => role.name!)}
                            />
                        </FormAccess>
                    </div>
                </div>
                <div className="border rounded-lg mt-4">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold">{t("permissions")}</h2>
                    </div>
                    <div className="p-4">
                        <FormAccess isHorizontal role="view-clients">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="applyToResourceType">{t("applyToResourceType")}</Label>
                                    <HelpItem
                                        helpText={t("applyToResourceTypeHelp")}
                                        fieldLabelId="applyToResourceType"
                                    />
                                </div>
                                <Switch
                                    id="applyToResource-switch"
                                    checked={applyToResourceType}
                                    onCheckedChange={setApplyToResourceType}
                                    aria-label={t("applyToResourceType")}
                                />
                            </div>
                            {!applyToResourceType ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Label>{t("resourcesAndScopes")}</Label>
                                        <HelpItem
                                            helpText={t("contextualAttributesHelp")}
                                            fieldLabelId={`resourcesAndScopes`}
                                        />
                                    </div>
                                    <KeyBasedAttributeInput
                                        selectableValues={resources.map<AttributeType>(
                                            item => ({
                                                name: item.name!,
                                                key: item._id!
                                            })
                                        )}
                                        resources={resources}
                                        name="resources"
                                    />
                                </div>
                            ) : (
                                <>
                                    <TextControl
                                        name="alias"
                                        label={t("resourceType")}
                                        labelIcon={t("resourceTypeHelp")}
                                        rules={{ required: t("required") }}
                                    />
                                    <SelectControl
                                        name="authScopes"
                                        label={t("authScopes")}
                                        labelIcon={t("scopesSelect")}
                                        controller={{
                                            defaultValue: []
                                        }}
                                        variant="typeaheadMulti"
                                        options={scopes.map(s => s.name!)}
                                    />
                                </>
                            )}
                            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                                <CollapsibleTrigger className="font-medium">
                                    {t("contextualInfo")}
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Label>{t("contextualAttributes")}</Label>
                                            <HelpItem
                                                helpText={t("contextualAttributesHelp")}
                                                fieldLabelId={`contextualAttributes`}
                                            />
                                        </div>
                                        <KeyBasedAttributeInput
                                            selectableValues={defaultContextAttributes}
                                            name="context.attributes"
                                        />
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </FormAccess>
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <Button
                        data-testid="authorization-eval"
                        id="authorization-eval"
                        disabled={!isValid}
                        onClick={() => evaluate()}
                    >
                        {t("evaluate")}
                    </Button>
                    <Button
                        data-testid="authorization-revert"
                        id="authorization-revert"
                        variant="link"
                        onClick={() => reset()}
                    >
                        {t("revert")}
                    </Button>
                </div>
            </FormProvider>
        </div>
    );
};
