import type { ConfigPropertyRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigInfoRepresentation";
import type ClientPolicyConditionRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientPolicyConditionRepresentation";
import type ClientPolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientPolicyRepresentation";
import type ComponentTypeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentTypeRepresentation";
import { HelpItem, useAlerts, useFetch } from "../../shared/keycloak-ui-shared";
import { AlertVariant } from "../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Label } from "@merge/ui/components/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@merge/ui/components/select";
import { camelCase } from "lodash-es";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { DynamicComponents } from "../components/dynamic/DynamicComponents";
import { FormAccess } from "../components/form/FormAccess";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { useRealm } from "../context/realm-context/RealmContext";
import { useServerInfo } from "../context/server-info/ServerInfoProvider";
import { toEditClientPolicy } from "./routes/EditClientPolicy";
import type { EditClientPolicyConditionParams } from "./routes/EditCondition";

export type ItemType = { value: string };

type ConfigProperty = ConfigPropertyRepresentation & {
    conditions: any;
    config: any;
};

export default function NewClientPolicyCondition() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { addAlert, addError } = useAlerts();
    const navigate = useNavigate();
    const { realm } = useRealm();

    const [openConditionType, setOpenConditionType] = useState(false);
    const [isGlobalPolicy, setIsGlobalPolicy] = useState(false);
    const [policies, setPolicies] = useState<ClientPolicyRepresentation[]>([]);

    const [condition, setCondition] = useState<ClientPolicyConditionRepresentation[]>([]);
    const [conditionData, setConditionData] =
        useState<ClientPolicyConditionRepresentation>();
    const [conditionType, setConditionType] = useState("");
    const [conditionProperties, setConditionProperties] = useState<
        ConfigPropertyRepresentation[]
    >([]);

    const { policyName, conditionName } = useParams<EditClientPolicyConditionParams>();

    const serverInfo = useServerInfo();
    const form = useForm<ConfigProperty>();

    const conditionTypes =
        serverInfo.componentTypes?.[
            "org.keycloak.services.clientpolicy.condition.ClientPolicyConditionProvider"
        ];

    const setupForm = (condition: ClientPolicyConditionRepresentation) => {
        form.reset({ config: condition.configuration || {} });
    };

    useFetch(
        () =>
            adminClient.clientPolicies.listPolicies({
                includeGlobalPolicies: true
            }),

        policies => {
            setPolicies(policies.policies ?? []);

            if (conditionName) {
                let currentPolicy = policies.policies?.find(
                    item => item.name === policyName
                );
                if (currentPolicy === undefined) {
                    currentPolicy = policies.globalPolicies?.find(
                        item => item.name === policyName
                    );
                    setIsGlobalPolicy(currentPolicy !== undefined);
                }

                const typeAndConfigData = currentPolicy?.conditions?.find(
                    item => item.condition === conditionName
                );

                const currentCondition = conditionTypes?.find(
                    condition => condition.id === conditionName
                );

                setConditionData(typeAndConfigData!);
                setConditionProperties(currentCondition?.properties!);
                setupForm(typeAndConfigData!);
            }
        },
        []
    );

    const save = async (configPolicy: ConfigProperty) => {
        const configValues = configPolicy.config;

        const writeConfig = () => {
            return conditionProperties.reduce((r: any, p) => {
                r[p.name!] = configValues[p.name!];
                return r;
            }, {});
        };

        const updatedPolicies = policies.map(policy => {
            if (policy.name !== policyName) {
                return policy;
            }

            let conditions = policy.conditions ?? [];

            if (conditionName) {
                const createdCondition = {
                    condition: conditionData?.condition,
                    configuration: writeConfig()
                };

                const index = conditions.findIndex(
                    condition => conditionName === condition.condition
                );

                if (index === -1) {
                    return;
                }

                const newConditions = [
                    ...conditions.slice(0, index),
                    createdCondition,
                    ...conditions.slice(index + 1)
                ];

                return {
                    ...policy,
                    conditions: newConditions
                };
            }

            conditions = conditions.concat({
                condition: condition[0].condition,
                configuration: writeConfig()
            });

            return {
                ...policy,
                conditions
            };
        }) as ClientPolicyRepresentation[];

        try {
            await adminClient.clientPolicies.updatePolicy({
                policies: updatedPolicies
            });
            setPolicies(updatedPolicies);
            navigate(toEditClientPolicy({ realm, policyName: policyName! }));
            addAlert(
                conditionName
                    ? t("updateClientConditionSuccess")
                    : t("createClientConditionSuccess"),
                AlertVariant.success
            );
        } catch (error) {
            addError("createClientConditionError", error);
        }
    };

    return (
        <>
            <ViewHeader
                titleKey={
                    conditionName
                        ? isGlobalPolicy
                            ? t("viewCondition")
                            : t("editCondition")
                        : t("addCondition")
                }
                divider
            />
            <div className="p-6">
                <FormAccess
                    isHorizontal
                    role="manage-realm"
                    isReadOnly={isGlobalPolicy}
                    className="mt-6"
                    onSubmit={form.handleSubmit(save)}
                >
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <Label htmlFor="conditionType">{t("conditionType")}</Label>
                            <HelpItem
                                helpText={
                                    conditionType
                                        ? `${camelCase(conditionType.replace(/-/g, " "))}Help`
                                        : "conditionsHelp"
                                }
                                fieldLabelId="conditionType"
                            />
                        </div>
                        <Controller
                            name="conditions"
                            defaultValue={"any-client"}
                            control={form.control}
                            render={({ field }) => {
                                const selectedId =
                                    conditionName ||
                                    conditionType ||
                                    (typeof field.value === "object" && field.value?.id
                                        ? field.value.id
                                        : field.value);
                                return (
                                    <Select
                                        value={selectedId || ""}
                                        onValueChange={value => {
                                            const item = conditionTypes?.find(
                                                c => c.id === value
                                            );
                                            if (item) {
                                                field.onChange(item);
                                                setConditionProperties(item.properties);
                                                setConditionType(item.id);
                                                setCondition([{ condition: item.id }]);
                                                setOpenConditionType(false);
                                            }
                                        }}
                                        disabled={!!conditionName}
                                        onOpenChange={setOpenConditionType}
                                    >
                                        <SelectTrigger
                                            id="provider"
                                            className="kc-conditionType-select w-full"
                                            data-testid="conditionType-select"
                                            aria-label={t("conditionType")}
                                        >
                                            <SelectValue
                                                placeholder={t("selectACondition")}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {conditionTypes?.map(condition => (
                                                <SelectItem
                                                    key={condition.id}
                                                    value={condition.id}
                                                    data-testid={condition.id}
                                                >
                                                    {condition.id}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                );
                            }}
                        />
                    </div>

                    <FormProvider {...form}>
                        <DynamicComponents properties={conditionProperties} />
                    </FormProvider>
                    {!isGlobalPolicy && (
                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                data-testid="addCondition-saveBtn"
                                disabled={
                                    conditionType === "" &&
                                    !conditionName &&
                                    isGlobalPolicy
                                }
                            >
                                {conditionName ? t("save") : t("add")}
                            </Button>
                            <Button
                                variant="ghost"
                                data-testid="addCondition-cancelBtn"
                                onClick={() =>
                                    navigate(
                                        toEditClientPolicy({
                                            realm,
                                            policyName: policyName!
                                        })
                                    )
                                }
                            >
                                {t("cancel")}
                            </Button>
                        </div>
                    )}
                </FormAccess>
                {isGlobalPolicy && (
                    <div className="kc-backToProfile">
                        <Button asChild>
                            <Link to={toEditClientPolicy({ realm, policyName: policyName! })}>
                                {t("back")}
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}
