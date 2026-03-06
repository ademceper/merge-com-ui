import PolicyRepresentation, {
    DecisionStrategy,
    Logic
} from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import PolicyProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyProviderRepresentation";
import { useTranslation } from "react-i18next";
import { Button } from "@merge-rd/ui/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@merge-rd/ui/components/dialog";
import { getErrorDescription, getErrorMessage, SelectField,
    TextControl } from "../../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useAdminClient } from "../../admin-client";
import { useRealm } from "../../context/realm-context/realm-context";
import { Client } from "../../clients/authorization/policy/client";
import { User } from "../../clients/authorization/policy/user";
import {
    ClientScope,
    RequiredIdValue
} from "../../clients/authorization/policy/client-scope";
import { Group, GroupValue } from "../../clients/authorization/policy/group";
import { Regex } from "../../clients/authorization/policy/regex";
import { Role } from "../../clients/authorization/policy/role";
import { Time } from "../../clients/authorization/policy/time";
import { JavaScript } from "../../clients/authorization/policy/java-script";
import { LogicSelector } from "../../clients/authorization/policy/logic-selector";
import { Aggregate } from "../../clients/authorization/policy/aggregate";
import { capitalize } from "lodash-es";
import { useEffect, type JSX } from "react";

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

export const isValidComponentType = (value: string) => value in COMPONENTS;

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
    const { adminClient } = useAdminClient();
    const { realmRepresentation } = useRealm();
    const { t } = useTranslation();
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
        return COMPONENTS["default"];
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
            const createdPolicy = await adminClient.clients.createPolicy(
                { id: permissionClientId, type: policyTypeSelector! },
                cleanedPolicy
            );

            onAssign(createdPolicy);
            toggleDialog();
            toast.success(t("createPolicySuccess"));
        } catch (error) {
            toast.error(t("policySaveError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <Dialog open onOpenChange={(open) => { if (!open) toggleDialog(); }}>
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
