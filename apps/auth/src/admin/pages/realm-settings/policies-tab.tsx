import type ClientPolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientPolicyRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@merge-rd/ui/components/alert-dialog";
import { Button } from "@merge-rd/ui/components/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge-rd/ui/components/empty";
import { Label } from "@merge-rd/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@merge-rd/ui/components/radio-group";
import { Separator } from "@merge-rd/ui/components/separator";
import { Switch } from "@merge-rd/ui/components/switch";
import { Link, useNavigate } from "@tanstack/react-router";
import { omit } from "lodash-es";
import { useEffect, useState } from "react";
import { Controller, type UseFormReturn, useForm } from "react-hook-form";
import { toast } from "sonner";
import { DataTable, DataTableRowActions } from "@/admin/shared/ui/data-table";
import {
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner
} from "../../../shared/keycloak-ui-shared";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { useUpdateClientPolicy } from "./hooks/use-update-client-policy";
import {
    toAddClientPolicy,
    toClientPolicies,
    toEditClientPolicy
} from "../../shared/lib/routes/realm-settings";
import { translationFormatter } from "../../shared/lib/translation-formatter";
import { prettyPrintJSON } from "../../shared/lib/util";
import { useConfirmDialog } from "../../shared/ui/confirm-dialog/confirm-dialog";
import { CodeEditor } from "../../shared/ui/form/code-editor";
import { useClientPolicies } from "./hooks/use-client-policies";

type ClientPolicy = ClientPolicyRepresentation & {
    global?: boolean;
};

export const PoliciesTab = () => {

    const { t } = useTranslation();
    const { realm } = useRealm();
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [policies, setPolicies] = useState<ClientPolicy[]>();
    const [selectedPolicy, setSelectedPolicy] = useState<ClientPolicy>();
    const [code, setCode] = useState<string>();
    const [tablePolicies, setTablePolicies] = useState<ClientPolicy[]>();

    const form = useForm<Record<string, boolean>>({ mode: "onChange" });

    const { mutateAsync: updateClientPolicyMut } = useUpdateClientPolicy();
    const { data: allPoliciesData } = useClientPolicies();

    useEffect(() => {
        if (allPoliciesData) {
            const globalPolicies = allPoliciesData.globalPolicies?.map(p => ({
                ...p,
                global: true
            }));

            const pols = allPoliciesData.policies?.map(p => ({
                ...p,
                global: false
            }));

            const allClientPolicies = globalPolicies?.concat(pols ?? []);

            setPolicies(allClientPolicies);
            setTablePolicies(allClientPolicies || []);
            setCode(prettyPrintJSON(allClientPolicies));
        }
    }, [allPoliciesData]);

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
            await updateClientPolicyMut({
                policies: updatedPolicies
            });
            navigate({ to: toClientPolicies({ realm, tab: "policies" }) as string });
            toast.success(t("updateClientPolicySuccess"));
        } catch (error) {
            toast.error(t("updateClientPolicyError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
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
                await updateClientPolicyMut({
                    policies: changedPolicies,
                    globalPolicies: changedGlobalPolicies
                });
                toast.success(t("updateClientPoliciesSuccess"));
                // cache invalidated by hook
            } catch (error) {
                toast.error(
                    t("updateClientPoliciesError", { error: getErrorMessage(error) }),
                    { description: getErrorDescription(error) }
                );
            }
        } catch (error) {
            toast.error(
                t("invalidJsonClientPoliciesError", { error: getErrorMessage(error) }),
                { description: getErrorDescription(error) }
            );
        }
    };

    const onDeleteConfirm = async () => {
        if (!selectedPolicy) return;
        const updatedPolicies = policies
            ?.filter(policy => {
                return !policy.global && policy.name !== selectedPolicy.name;
            })
            .map<ClientPolicyRepresentation>(policy => {
                const newPolicy = { ...policy };
                delete newPolicy.global;
                return newPolicy;
            });

        try {
            await updateClientPolicyMut({
                policies: updatedPolicies ?? []
            });
            setSelectedPolicy(undefined);
            toast.success(t("deleteClientPolicySuccess"));
            // cache invalidated by hook
        } catch (error) {
            toast.error(t("deleteClientPolicyError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    if (!policies) {
        return <KeycloakSpinner />;
    }
    return (
        <>
            <AlertDialog
                open={!!selectedPolicy}
                onOpenChange={open => !open && setSelectedPolicy(undefined)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("deleteClientPolicyConfirmTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("deleteClientPolicyConfirm", {
                                policyName: selectedPolicy?.name
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            data-testid="confirm"
                            onClick={onDeleteConfirm}
                        >
                            {t("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="pt-0">
                <div className="flex gap-2 kc-policies-config-section items-center">
                    <div>
                        <h1 className="text-base font-medium">
                            {t("policiesConfigType")}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <RadioGroup
                            value={show ? "json" : "form"}
                            onValueChange={v => setShow(v === "json")}
                        >
                            <div className="flex items-center gap-2">
                                <RadioGroupItem
                                    value="form"
                                    id="formView-policiesView"
                                    data-testid="formView-policiesView"
                                />
                                <Label htmlFor="formView-policiesView">
                                    {t("policiesConfigTypes.formView")}
                                </Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem
                                    value="json"
                                    id="jsonEditor-policiesView"
                                    data-testid="jsonEditor-policiesView"
                                />
                                <Label htmlFor="jsonEditor-policiesView">
                                    {t("policiesConfigTypes.jsonEditor")}
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
            </div>
            <Separator />
            {!show ? (
                <DataTable<ClientPolicy>
                    key={policies.length}
                    columns={[
                        {
                            accessorKey: "name",
                            header: t("name"),
                            cell: ({ row }) =>
                                row.original.global ? (
                                    row.original.name
                                ) : (
                                    <Link
                                        to={
                                            toEditClientPolicy({
                                                realm,
                                                policyName: row.original.name!
                                            }) as string
                                        }
                                    >
                                        {row.original.name}
                                    </Link>
                                )
                        },
                        {
                            accessorKey: "enabled",
                            header: t("status"),
                            cell: ({ row }) => (
                                <SwitchRenderer
                                    clientPolicy={row.original}
                                    form={form}
                                    saveStatus={saveStatus}
                                    onConfirm={async () => {
                                        form.setValue(row.original.name!, false);
                                        await saveStatus();
                                    }}
                                />
                            )
                        },
                        {
                            accessorKey: "description",
                            header: t("description"),
                            cell: ({ row }) =>
                                translationFormatter(t)(row.original.description)
                        },
                        {
                            id: "actions",
                            cell: ({ row }) =>
                                row.original.global ? null : (
                                    <DataTableRowActions row={row}>
                                        <button
                                            type="button"
                                            className="rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10"
                                            onClick={() =>
                                                setSelectedPolicy(row.original)
                                            }
                                        >
                                            {t("delete")}
                                        </button>
                                    </DataTableRowActions>
                                )
                        }
                    ]}
                    data={tablePolicies ?? []}
                    searchColumnId="name"
                    searchPlaceholder={t("clientPolicySearch")}
                    emptyContent={
                        <Empty className="py-12">
                            <EmptyHeader>
                                <EmptyTitle>{t("noClientPolicies")}</EmptyTitle>
                            </EmptyHeader>
                            <EmptyContent>
                                <EmptyDescription>
                                    {t("noClientPoliciesInstructions")}
                                </EmptyDescription>
                            </EmptyContent>
                            <Button asChild className="mt-2">
                                <Link to={toAddClientPolicy({ realm }) as string}>
                                    {t("createClientPolicy")}
                                </Link>
                            </Button>
                        </Empty>
                    }
                    emptyMessage={t("noClientPolicies")}
                    toolbar={
                        <Button id="createPolicy" asChild data-testid="createPolicy">
                            <Link to={toAddClientPolicy({ realm }) as string}>
                                {t("createClientPolicy")}
                            </Link>
                        </Button>
                    }
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
                        <Button data-testid="jsonEditor-policies-saveBtn" onClick={save}>
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
                            onCheckedChange={value => {
                                if (!value) {
                                    toggleDisableDialog();
                                } else {
                                    field.onChange(value);
                                    saveStatus();
                                }
                            }}
                            aria-label={clientPolicy.name!}
                        />
                        <span className="text-sm">
                            {field.value ? t("enabled") : t("disabled")}
                        </span>
                    </div>
                )}
            />
        </>
    );
};
