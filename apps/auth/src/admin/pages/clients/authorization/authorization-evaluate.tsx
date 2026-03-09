import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import type EvaluationResultRepresentation from "@keycloak/keycloak-admin-client/lib/defs/evaluationResultRepresentation";
import type PolicyEvaluationResponse from "@keycloak/keycloak-admin-client/lib/defs/policyEvaluationResponse";
import type ResourceEvaluation from "@keycloak/keycloak-admin-client/lib/defs/resourceEvaluation";
import type ResourceRepresentation from "@keycloak/keycloak-admin-client/lib/defs/resourceRepresentation";
import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import type ScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/scopeRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from "@merge-rd/ui/components/collapsible";
import { Label } from "@merge-rd/ui/components/label";
import { Switch } from "@merge-rd/ui/components/switch";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    HelpItem,
    MultiSelectField,
    TextControl
} from "@/shared/keycloak-ui-shared";
import { useAccess } from "@/admin/app/providers/access/access";
import { useEvaluateResource } from "./hooks/use-authorization-mutations";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { ClientSelect } from "@/admin/shared/ui/client/client-select";
import { FormAccess } from "@/admin/shared/ui/form/form-access";
import {
    type KeyValueType,
    keyValueToArray
} from "@/admin/shared/ui/key-value-form/key-value-convert";
import { UserSelect } from "@/admin/shared/ui/users/user-select";
import { ForbiddenSection } from "@/admin/pages/forbidden-section";
import type { FormFields } from "../client-details";
import { defaultContextAttributes } from "../utils";
import { useResourcesAndScopes } from "./hooks/use-resources-and-scopes";
import { useRoles } from "./hooks/use-roles";
import { Results } from "./evaluate/results";
import { KeyBasedAttributeInput } from "./key-based-attribute-input";

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

type AttributeType = {
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

type AttributeForm = Omit<EvaluateFormInputs, "context" | "resources"> & {
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

    const form = useForm<EvaluateFormInputs>({ mode: "onChange" });
    const {
        reset,
        trigger,
        formState: { isValid }
    } = form;
    const { t } = useTranslation();
    const realm = useRealm();
    const { mutateAsync: evaluateResourceMutation } = useEvaluateResource();
    const [isExpanded, setIsExpanded] = useState(false);
    const [applyToResourceType, setApplyToResourceType] = useState(false);
    const [resources, setResources] = useState<ResourceRepresentation[]>([]);
    const [scopes, setScopes] = useState<ScopeRepresentation[]>([]);
    const [evaluateResult, setEvaluateResult] = useState<PolicyEvaluationResponse>();
    const [clientRoles, setClientRoles] = useState<RoleRepresentation[]>([]);

    const { data: rolesData } = useRoles();
    const { data: resourcesScopesData } = useResourcesAndScopes(client.id!);

    useEffect(() => {
        if (rolesData) {
            setClientRoles(rolesData);
        }
    }, [rolesData]);

    useEffect(() => {
        if (resourcesScopesData) {
            setResources(resourcesScopesData[0]);
            setScopes(resourcesScopesData[1]);
        }
    }, [resourcesScopesData]);

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
                        Object.values(keys).flat().includes(s.name!)
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
            const evaluation = await evaluateResourceMutation({
                clientId: client.id!,
                realm: realm.realm!,
                evaluation: resEval
            });

            setEvaluateResult(evaluation);
        } catch (error) {
            toast.error(t("evaluateError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
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
                        <h2 className="text-lg font-semibold">
                            {t("identityInformation")}
                        </h2>
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
                            <MultiSelectField
                                name="roleIds"
                                label={t("roles")}
                                labelIcon={t("rolesHelp")}
                                defaultValue={[]}
                                rules={{ required: true }}
                                placeholderText={t("selectARole")}
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
                                    <Label htmlFor="applyToResourceType">
                                        {t("applyToResourceType")}
                                    </Label>
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
                                    <MultiSelectField
                                        name="authScopes"
                                        label={t("authScopes")}
                                        labelIcon={t("scopesSelect")}
                                        defaultValue={[]}
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
