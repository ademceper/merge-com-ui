import type ClientPolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientPolicyRepresentation";
import { getErrorDescription, getErrorMessage, Action,
    KeycloakDataTable,
    KeycloakSpinner,
    ListEmptyState,
    useFetch } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { Switch } from "@merge/ui/components/switch";
import { Separator } from "@merge/ui/components/separator";
import { RadioGroup, RadioGroupItem } from "@merge/ui/components/radio-group";
import { Label } from "@merge/ui/components/label";
import { omit } from "lodash-es";
import { useState } from "react";
import { Controller, useForm, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import CodeEditor from "../components/form/CodeEditor";
import { useRealm } from "../context/realm-context/RealmContext";
import { prettyPrintJSON } from "../util";
import { translationFormatter } from "../utils/translationFormatter";
import { toAddClientPolicy } from "./routes/AddClientPolicy";
import { toClientPolicies } from "./routes/ClientPolicies";
import { toEditClientPolicy } from "./routes/EditClientPolicy";

type ClientPolicy = ClientPolicyRepresentation & {
    global?: boolean;
};

export const PoliciesTab = () => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
const { realm } = useRealm();
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [policies, setPolicies] = useState<ClientPolicy[]>();
    const [selectedPolicy, setSelectedPolicy] = useState<ClientPolicy>();
    const [key, setKey] = useState(0);
    const [code, setCode] = useState<string>();
    const [tablePolicies, setTablePolicies] = useState<ClientPolicy[]>();
    const refresh = () => setKey(key + 1);

    const form = useForm<Record<string, boolean>>({ mode: "onChange" });

    useFetch(
        () =>
            adminClient.clientPolicies.listPolicies({
                includeGlobalPolicies: true
            }),
        allPolicies => {
            const globalPolicies = allPolicies.globalPolicies?.map(globalPolicies => ({
                ...globalPolicies,
                global: true
            }));

            const policies = allPolicies.policies?.map(policies => ({
                ...policies,
                global: false
            }));

            const allClientPolicies = globalPolicies?.concat(policies ?? []);

            setPolicies(allClientPolicies);
            setTablePolicies(allClientPolicies || []);
            setCode(prettyPrintJSON(allClientPolicies));
        },
        [key]
    );

    const loader = async () => policies ?? [];

    const saveStatus = async () => {
        const switchValues = form.getValues();

        const updatedPolicies = policies
            ?.filter(policy => {
                return !policy.global;
            })
            .map<ClientPolicyRepresentation>(policy => {
                const enabled = switchValues[policy.name!];
                const enabledPolicy = {
                    ...policy,
                    enabled
                };
                delete enabledPolicy.global;
                return enabledPolicy;
            });

        try {
            await adminClient.clientPolicies.updatePolicy({
                policies: updatedPolicies
            });
            navigate(toClientPolicies({ realm, tab: "policies" }));
            toast.success(t("updateClientPolicySuccess"));
        } catch (error) {
            toast.error(t("updateClientPolicyError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const normalizePolicy = (policy: ClientPolicy): ClientPolicyRepresentation =>
        omit(policy, "global");

    const save = async () => {
        if (!code) {
            return;
        }

        try {
            const obj: ClientPolicy[] = JSON.parse(code);

            const changedPolicies = obj
                .filter(policy => !policy.global)
                .map(policy => normalizePolicy(policy));

            const changedGlobalPolicies = obj
                .filter(policy => policy.global)
                .map(policy => normalizePolicy(policy));

            try {
                await adminClient.clientPolicies.updatePolicy({
                    policies: changedPolicies,
                    globalPolicies: changedGlobalPolicies
                });
                toast.success(t("updateClientPoliciesSuccess"));
                refresh();
            } catch (error) {
                toast.error(t("updateClientPoliciesError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        } catch (error) {
            console.warn("Invalid json, ignoring value using {}");
            toast.error(t("invalidJsonClientPoliciesError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: t("deleteClientPolicyConfirmTitle"),
        messageKey: t("deleteClientPolicyConfirm", {
            policyName: selectedPolicy?.name
        }),
        continueButtonLabel: t("delete"),
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            const updatedPolicies = policies
                ?.filter(policy => {
                    return !policy.global && policy.name !== selectedPolicy?.name;
                })
                .map<ClientPolicyRepresentation>(policy => {
                    const newPolicy = { ...policy };
                    delete newPolicy.global;
                    return newPolicy;
                });

            try {
                await adminClient.clientPolicies.updatePolicy({
                    policies: updatedPolicies
                });
                toast.success(t("deleteClientPolicySuccess"));
                refresh();
            } catch (error) {
                toast.error(t("deleteClientPolicyError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        }
    });

    if (!policies) {
        return <KeycloakSpinner />;
    }
    return (
        <>
            <DeleteConfirm />
            <div className="p-6">
                <div className="flex gap-2 kc-policies-config-section items-center">
                    <div>
                        <h1 className="text-base font-medium">
                            {t("policiesConfigType")}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <RadioGroup value={show ? "json" : "form"} onValueChange={(v) => setShow(v === "json")}>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem
                                    value="form"
                                    id="formView-policiesView"
                                    data-testid="formView-policiesView"
                                />
                                <Label htmlFor="formView-policiesView">{t("policiesConfigTypes.formView")}</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem
                                    value="json"
                                    id="jsonEditor-policiesView"
                                    data-testid="jsonEditor-policiesView"
                                />
                                <Label htmlFor="jsonEditor-policiesView">{t("policiesConfigTypes.jsonEditor")}</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
            </div>
            <Separator />
            {!show ? (
                <KeycloakDataTable
                    key={policies.length}
                    emptyState={
                        <ListEmptyState
                            message={t("noClientPolicies")}
                            instructions={t("noClientPoliciesInstructions")}
                            primaryActionText={t("createClientPolicy")}
                            onPrimaryAction={() => navigate(toAddClientPolicy({ realm }))}
                        />
                    }
                    ariaLabelKey="clientPolicies"
                    searchPlaceholderKey="clientPolicySearch"
                    loader={loader}
                    toolbarItem={
                        <div>
                            <Button
                                id="createPolicy"
                                asChild
                                data-testid="createPolicy"
                            >
                                <Link to={toAddClientPolicy({ realm })}>
                                    {t("createClientPolicy")}
                                </Link>
                            </Button>
                        </div>
                    }
                    isRowDisabled={value => !!value.global}
                    actions={[
                        {
                            title: t("delete"),
                            onRowClick: item => {
                                toggleDeleteDialog();
                                setSelectedPolicy(item);
                            }
                        } as Action<ClientPolicy>
                    ]}
                    columns={[
                        {
                            name: "name",
                            cellRenderer: ({ name }: ClientPolicyRepresentation) => (
                                <Link
                                    to={toEditClientPolicy({ realm, policyName: name! })}
                                >
                                    {name}
                                </Link>
                            )
                        },
                        {
                            name: "enabled",
                            displayKey: "status",
                            cellRenderer: clientPolicy => (
                                <SwitchRenderer
                                    clientPolicy={clientPolicy}
                                    form={form}
                                    saveStatus={saveStatus}
                                    onConfirm={async () => {
                                        form.setValue(clientPolicy.name!, false);
                                        await saveStatus();
                                    }}
                                />
                            )
                        },
                        {
                            name: "description",
                            cellFormatters: [translationFormatter(t)]
                        }
                    ]}
                />
            ) : (
                <>
                    <div className="mt-4 ml-4">
                        <CodeEditor
                            value={code}
                            language="json"
                            onChange={value => setCode(value)}
                            height={480}
                        />
                    </div>
                    <div className="mt-4 flex gap-2 ml-4">
                        <Button
                            data-testid="jsonEditor-policies-saveBtn"
                            onClick={save}
                        >
                            {t("save")}
                        </Button>
                        <Button
                            variant="link"
                            data-testid="jsonEditor-reloadBtn"
                            onClick={() => {
                                setCode(prettyPrintJSON(tablePolicies));
                            }}
                        >
                            {t("reload")}
                        </Button>
                    </div>
                </>
            )}
        </>
    );
};

type SwitchRendererProps = {
    clientPolicy: ClientPolicy;
    form: UseFormReturn<Record<string, boolean>>;
    saveStatus: () => void;
    onConfirm: () => void;
};

const SwitchRenderer = ({
    clientPolicy,
    form,
    saveStatus,
    onConfirm
}: SwitchRendererProps) => {
    const { t } = useTranslation();
    const [toggleDisableDialog, DisableConfirm] = useConfirmDialog({
        titleKey: "disablePolicyConfirmTitle",
        messageKey: "disablePolicyConfirm",
        continueButtonLabel: "disable",
        onConfirm
    });

    return (
        <>
            <DisableConfirm />
            <Controller
                name={clientPolicy.name!}
                data-testid={`${clientPolicy.name!}-switch`}
                defaultValue={clientPolicy.enabled}
                control={form.control}
                render={({ field }) => (
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={field.value}
                            disabled={clientPolicy.global}
                            onCheckedChange={(value) => {
                                if (!value) {
                                    toggleDisableDialog();
                                } else {
                                    field.onChange(value);
                                    saveStatus();
                                }
                            }}
                            aria-label={clientPolicy.name!}
                        />
                        <span className="text-sm">{field.value ? t("enabled") : t("disabled")}</span>
                    </div>
                )}
            />
        </>
    );
};
