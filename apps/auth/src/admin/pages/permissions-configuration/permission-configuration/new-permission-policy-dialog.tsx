import type PolicyProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyProviderRepresentation";
import type PolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import {
    DecisionStrategy,
    Logic
} from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@merge-rd/ui/components/dialog";
import { capitalize } from "lodash-es";
import { type JSX, useEffect } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    SelectField,
    TextControl
} from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { useCreatePolicy } from "../hooks/use-create-policy";
import { Aggregate } from "@/admin/pages/clients/authorization/policy/aggregate";
import { Client } from "@/admin/pages/clients/authorization/policy/client";
import {
    ClientScope,
    type RequiredIdValue
} from "@/admin/pages/clients/authorization/policy/client-scope";
import { Group, type GroupValue } from "@/admin/pages/clients/authorization/policy/group";
import { JavaScript } from "@/admin/pages/clients/authorization/policy/java-script";
import { LogicSelector } from "@/admin/pages/clients/authorization/policy/logic-selector";
import { Regex } from "@/admin/pages/clients/authorization/policy/regex";
import { Role } from "@/admin/pages/clients/authorization/policy/role";
import { Time } from "@/admin/pages/clients/authorization/policy/time";
import { User } from "@/admin/pages/clients/authorization/policy/user";

type Policy = Omit<PolicyRepresentation, "roles"> & {
    groups?: GroupValue[];
    clientScopes?: RequiredIdValue[];
    roles?: RequiredIdValue[];
    clients?: [];
};

type ComponentsProps = {
    isPermissionClient?: boolean;
    permissionClientId: string;
};

const defaultValues: Policy = {
    name: "",
    description: "",
    type: "group",
    policies: [],
    decisionStrategy: DecisionStrategy.UNANIMOUS,
    logic: Logic.POSITIVE
};

const COMPONENTS: {
    [index: string]: ({
        isPermissionClient,
        permissionClientId
    }: ComponentsProps) => JSX.Element;
} = {
    aggregate: Aggregate,
    client: Client,
    user: User,
    "client-scope": ClientScope,
    group: Group,
    regex: Regex,
    role: Role,
    time: Time,
    js: JavaScript,
    default: Group
} as const;

const isValidComponentType = (value: string) => value in COMPONENTS;

type NewPermissionConfigurationDialogProps = {
    permissionClientId: string;
    providers: PolicyProviderRepresentation[];
    policies: PolicyRepresentation[];
    resourceType: string;
    toggleDialog: () => void;
    onAssign: (newPolicy: PolicyRepresentation) => void;
};

export const NewPermissionPolicyDialog = ({
    permissionClientId,
    providers,
    policies,
    toggleDialog,
    onAssign
}: NewPermissionConfigurationDialogProps) => {
    const { realmRepresentation } = useRealm();
    const { t } = useTranslation();
    const { mutateAsync: createPolicyMut } = useCreatePolicy(permissionClientId);
    const form = useForm<Policy>({
        mode: "onChange",
        defaultValues
    });
    const { handleSubmit, reset } = form;
    const isPermissionClient = realmRepresentation?.adminPermissionsEnabled;

    const policyTypeSelector = useWatch({
        control: form.control,
        name: "type"
    });

    function getComponentType() {
        if (policyTypeSelector && isValidComponentType(policyTypeSelector)) {
            return COMPONENTS[policyTypeSelector];
        }
        return COMPONENTS.default;
    }

    const ComponentType = getComponentType();

    useEffect(() => {
        if (policyTypeSelector) {
            const { name, description, decisionStrategy, logic } = form.getValues();

            reset({
                type: policyTypeSelector,
                name,
                description,
                decisionStrategy,
                logic
            });
        }
    }, [policyTypeSelector, reset, form]);

    const save = async (policy: Policy) => {
        const { groups, roles, policies, clients, ...rest } = policy;

        const cleanedPolicy = {
            ...rest,
            ...(groups && groups.length > 0 && { groups }),
            ...(roles && roles.length > 0 && { roles }),
            ...(policies && policies.length > 0 && { policies }),
            ...(clients && clients.length > 0 && { clients }),
            ...(rest.type === "group" &&
                (!groups || groups.length === 0) && { groups: [] }),
            ...(rest.type === "client" &&
                (!clients || clients.length === 0) && { clients: [] })
        };

        try {
            const createdPolicy = await createPolicyMut({
                type: policyTypeSelector!,
                policy: cleanedPolicy
            });

            onAssign(createdPolicy);
            toggleDialog();
            toast.success(t("createPolicySuccess"));
        } catch (error) {
            toast.error(t("policySaveError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    return (
        <Dialog
            open
            onOpenChange={open => {
                if (!open) toggleDialog();
            }}
        >
            <DialogContent className="max-w-2xl" aria-label={t("createPermissionPolicy")}>
                <DialogHeader>
                    <DialogTitle>{t("createPermissionPolicy")}</DialogTitle>
                </DialogHeader>
                <form
                    id="createPermissionPolicy-form"
                    onSubmit={async e => {
                        e.stopPropagation();
                        await handleSubmit(save)(e);
                    }}
                >
                    <FormProvider {...form}>
                        <TextControl
                            name="name"
                            label={t("name")}
                            rules={{ required: t("required") }}
                        />
                        <TextControl name="description" label={t("description")} />
                        {providers && providers.length > 0 && (
                            <SelectField
                                name="type"
                                label={t("policyType")}
                                labelIcon={t("policyTypeHelpText")}
                                options={providers.map(provider => ({
                                    key: provider.type!,
                                    value: capitalize(provider.type!)
                                }))}
                                defaultValue=""
                            />
                        )}
                        <ComponentType
                            isPermissionClient={isPermissionClient}
                            permissionClientId={permissionClientId}
                        />
                        <LogicSelector />
                    </FormProvider>
                    <div className="flex gap-2 mt-4">
                        <Button
                            className="mr-2"
                            type="submit"
                            data-testid="save"
                            disabled={
                                policies?.length === 0 &&
                                policyTypeSelector === "aggregate"
                            }
                        >
                            {t("save")}
                        </Button>
                        <Button
                            variant="link"
                            data-testid="cancel"
                            onClick={toggleDialog}
                        >
                            {t("cancel")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
