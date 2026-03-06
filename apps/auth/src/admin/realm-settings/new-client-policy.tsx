import type ClientPolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientPolicyRepresentation";
import type ClientProfileRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientProfileRepresentation";
import { getErrorDescription, getErrorMessage, HelpItem,
    TextControl,
    useFetch } from "../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import { Button, buttonVariants } from "@merge-rd/ui/components/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@merge-rd/ui/components/dropdown-menu";
import { Switch } from "@merge-rd/ui/components/switch";
import { Label } from "@merge-rd/ui/components/label";
import { Separator } from "@merge-rd/ui/components/separator";
import { Textarea } from "@merge-rd/ui/components/textarea";
import { Plus, Trash } from "@phosphor-icons/react";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { useConfirmDialog } from "../components/confirm-dialog/confirm-dialog";
import { FormAccess } from "../components/form/form-access";
import { KeycloakSpinner } from "../../shared/keycloak-ui-shared";

import { useRealm } from "../context/realm-context/realm-context";
import { useServerInfo } from "../context/server-info/server-info-provider";
import { useParams } from "../utils/useParams";
import { AddClientProfileModal } from "./add-client-profile-modal";
import { toNewClientPolicyCondition } from "./routes/add-condition";
import { toClientPolicies } from "./routes/client-policies";
import { toClientProfile } from "./routes/client-profile";
import { EditClientPolicyParams, toEditClientPolicy } from "./routes/edit-client-policy";
import { toEditClientPolicyCondition } from "./routes/edit-condition";

type FormFields = Required<ClientPolicyRepresentation>;

const defaultValues: FormFields = {
    name: "",
    description: "",
    conditions: [],
    enabled: true,
    profiles: []
};

type PolicyDetailAttributes = {
    idx: number;
    name: string;
};

export default function NewClientPolicy() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { realm } = useRealm();
const [isGlobalPolicy, setIsGlobalPolicy] = useState(false);
    const [policies, setPolicies] = useState<ClientPolicyRepresentation[]>();
    const [globalPolicies, setGlobalPolicies] = useState<ClientPolicyRepresentation[]>();
    const [allPolicies, setAllPolicies] = useState<ClientPolicyRepresentation[]>();
    const [clientProfiles, setClientProfiles] = useState<ClientProfileRepresentation[]>(
        []
    );

    const [currentPolicy, setCurrentPolicy] = useState<ClientPolicyRepresentation>();
    const [showAddConditionsAndProfilesForm, setShowAddConditionsAndProfilesForm] =
        useState(false);

    const [conditionToDelete, setConditionToDelete] = useState<PolicyDetailAttributes>();

    const [profilesModalOpen, setProfilesModalOpen] = useState(false);

    const [profileToDelete, setProfileToDelete] = useState<PolicyDetailAttributes>();

    const { policyName } = useParams<EditClientPolicyParams>();

    const navigate = useNavigate();
    const form = useForm<FormFields>({
        mode: "onChange",
        defaultValues
    });
    const { handleSubmit } = form;

    const formValues = form.getValues();

    useFetch(
        async () => {
            const [policies, profiles] = await Promise.all([
                adminClient.clientPolicies.listPolicies({
                    includeGlobalPolicies: true
                }),
                adminClient.clientPolicies.listProfiles({
                    includeGlobalProfiles: true
                })
            ]);

            return { policies, profiles };
        },
        ({ policies, profiles }) => {
            let currentPolicy = policies.policies?.find(item => item.name === policyName);
            if (currentPolicy === undefined) {
                currentPolicy = policies.globalPolicies?.find(
                    item => item.name === policyName
                );
                setIsGlobalPolicy(currentPolicy !== undefined);
            }

            const allClientProfiles = [
                ...(profiles.globalProfiles ?? []),
                ...(profiles.profiles ?? [])
            ];

            const allClientPolicies = [
                ...(policies.globalPolicies ?? []),
                ...(policies.policies ?? [])
            ];

            setPolicies(policies.policies ?? []);
            setGlobalPolicies(policies.globalPolicies ?? []);
            setAllPolicies(allClientPolicies);
            if (currentPolicy) {
                setupForm(currentPolicy);
                setClientProfiles(allClientProfiles);
                setCurrentPolicy(currentPolicy);
                setShowAddConditionsAndProfilesForm(true);
            }
        },
        []
    );

    const setupForm = (policy: ClientPolicyRepresentation) => {
        form.reset(policy);
    };

    const policy = (allPolicies || []).filter(policy => policy.name === policyName);
    const policyConditions = policy[0]?.conditions || [];
    const policyProfiles = policy[0]?.profiles || [];

    const serverInfo = useServerInfo();

    const conditionTypes =
        serverInfo.componentTypes?.[
            "org.keycloak.services.clientpolicy.condition.ClientPolicyConditionProvider"
        ];

    const save = async () => {
        const createdForm = form.getValues();
        const createdPolicy = {
            ...createdForm
        };

        const getAllPolicies = () => {
            const policyNameExists = policies?.some(
                policy => policy.name === createdPolicy.name
            );

            if (policyNameExists) {
                return policies?.map(policy =>
                    policy.name === createdPolicy.name ? createdPolicy : policy
                );
            } else if (createdForm.name !== policyName) {
                return policies
                    ?.filter(item => item.name !== policyName)
                    .concat(createdForm);
            }
            return policies?.concat(createdForm);
        };

        try {
            await adminClient.clientPolicies.updatePolicy({
                policies: getAllPolicies()
            });
            toast.success(
                policyName
                    ? t("updateClientPolicySuccess")
                    : t("createClientPolicySuccess")
            );
            navigate(toEditClientPolicy({ realm, policyName: createdForm.name! }));
            setShowAddConditionsAndProfilesForm(true);
        } catch (error) {
            toast.error(t("createClientPolicyError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: t("deleteClientPolicyConfirmTitle"),
        messageKey: t("deleteClientPolicyConfirm", {
            policyName: policyName
        }),
        continueButtonLabel: t("delete"),
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            const updatedPolicies = policies?.filter(
                policy => policy.name !== policyName
            );

            try {
                await adminClient.clientPolicies.updatePolicy({
                    policies: updatedPolicies
                });
                toast.success(t("deleteClientPolicySuccess"));
                navigate(
                    toClientPolicies({
                        realm,
                        tab: "policies"
                    })
                );
            } catch (error) {
                toast.error(t("deleteClientPolicyError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        }
    });

    const [toggleDeleteConditionDialog, DeleteConditionConfirm] = useConfirmDialog({
        titleKey: t("deleteClientPolicyConditionConfirmTitle"),
        messageKey: t("deleteClientPolicyConditionConfirm", {
            condition: conditionToDelete?.name
        }),
        continueButtonLabel: t("delete"),
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            if (conditionToDelete?.name) {
                currentPolicy?.conditions?.splice(conditionToDelete.idx!, 1);
                try {
                    await adminClient.clientPolicies.updatePolicy({
                        policies: policies
                    });
                    toast.success(t("deleteConditionSuccess"));
                    navigate(toEditClientPolicy({ realm, policyName: formValues.name! }));
                } catch (error) {
                    toast.error(t("deleteConditionError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
                }
            } else {
                const updatedPolicies = policies?.filter(
                    policy => policy.name !== policyName
                );

                try {
                    await adminClient.clientPolicies.updatePolicy({
                        policies: updatedPolicies
                    });
                    toast.success(t("deleteClientSuccess"));
                    navigate(
                        toClientPolicies({
                            realm,
                            tab: "policies"
                        })
                    );
                } catch (error) {
                    toast.error(t("deleteClientError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
                }
            }
        }
    });

    const [toggleDeleteProfileDialog, DeleteProfileConfirm] = useConfirmDialog({
        titleKey: t("deleteClientPolicyProfileConfirmTitle"),
        messageKey: t("deleteClientPolicyProfileConfirm", {
            profileName: profileToDelete?.name,
            policyName
        }),
        continueButtonLabel: t("delete"),
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            if (profileToDelete?.name) {
                currentPolicy?.profiles?.splice(profileToDelete.idx!, 1);
                try {
                    await adminClient.clientPolicies.updatePolicy({
                        policies: policies
                    });
                    toast.success(t("deleteClientPolicyProfileSuccess"));
                    form.setValue("profiles", currentPolicy?.profiles || []);
                    navigate(toEditClientPolicy({ realm, policyName: formValues.name! }));
                } catch (error) {
                    toast.error(t("deleteClientPolicyProfileError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
                }
            } else {
                const updatedPolicies = policies?.filter(
                    policy => policy.name !== policyName
                );

                try {
                    await adminClient.clientPolicies.updatePolicy({
                        policies: updatedPolicies
                    });
                    toast.success(t("deleteClientSuccess"));
                    navigate(
                        toClientPolicies({
                            realm,
                            tab: "policies"
                        })
                    );
                } catch (error) {
                    toast.error(t("deleteClientError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
                }
            }
        }
    });

    const reset = () => {
        if (currentPolicy?.name !== undefined) {
            form.setValue("name", currentPolicy.name);
        }

        if (currentPolicy?.description !== undefined) {
            form.setValue("description", currentPolicy.description);
        }
    };

    const toggleModal = () => {
        setProfilesModalOpen(!profilesModalOpen);
    };

    const addProfiles = async (profiles: string[]) => {
        const createdPolicy = {
            ...currentPolicy,
            profiles: policyProfiles.concat(profiles),
            conditions: currentPolicy?.conditions
        };

        const index = policies?.findIndex(policy => createdPolicy.name === policy.name);

        if (index === undefined || index === -1) {
            return;
        }

        const newPolicies = [
            ...(policies || []).slice(0, index),
            createdPolicy,
            ...(policies || []).slice(index + 1)
        ];

        try {
            await adminClient.clientPolicies.updatePolicy({
                policies: newPolicies
            });
            setPolicies(newPolicies);
            const allClientPolicies = [...(globalPolicies || []), ...newPolicies];
            setAllPolicies(allClientPolicies);
            setCurrentPolicy(createdPolicy);
            form.setValue("profiles", createdPolicy.profiles);
            navigate(toEditClientPolicy({ realm, policyName: formValues.name! }));
            toast.success(t("addClientProfileSuccess"));
        } catch (error) {
            toast.error(t("addClientProfileError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const [toggleDisableDialog, DisableConfirm] = useConfirmDialog({
        titleKey: "disablePolicyConfirmTitle",
        messageKey: "disablePolicyConfirm",
        continueButtonLabel: "disable",
        onConfirm: async () => {
            form.setValue("enabled", !form.getValues().enabled);
            await save();
        }
    });

    if (!policies) {
        return <KeycloakSpinner />;
    }

    return (
        <>
            <DeleteConditionConfirm />
            <DeleteProfileConfirm />
            <AddClientProfileModal
                onConfirm={async (profiles: ClientProfileRepresentation[]) => {
                    await addProfiles(profiles.map(item => item.name!));
                }}
                allProfiles={policyProfiles}
                open={profilesModalOpen}
                toggleDialog={toggleModal}
            />
            <Controller
                name="enabled"
                defaultValue={true}
                control={form.control}
                render={({ field }) => (
                    <>
                        <DisableConfirm />
                        <DeleteConfirm />
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                                {isGlobalPolicy && (
                                    <Label color="blue">{t("global")}</Label>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 mr-4">
                                    <Label htmlFor="client-policy-switch" className="text-sm">{t("enabled")}</Label>
                                    <Switch id="client-policy-switch" data-testid="client-policy-switch" disabled={isGlobalPolicy} checked={field.value} aria-label={t("enabled")} onCheckedChange={async value => {
                                        if (!value) {
                                            toggleDisableDialog();
                                        } else {
                                            field.onChange(value);
                                            await save();
                                        }
                                    }} />
                                </div>
                                {(showAddConditionsAndProfilesForm || policyName) && !isGlobalPolicy && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger data-testid="action-dropdown" className={buttonVariants()}>
                                            {t("action")}
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                key="delete"
                                                data-testid="deleteClientPolicyDropdown"
                                                onClick={() => toggleDeleteDialog()}
                                            >
                                                {t("deleteClientPolicy")}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>
                    </>
                )}
            />
            <section className="py-6 bg-muted/30">
                <FormAccess
                    onSubmit={handleSubmit(save)}
                    isHorizontal
                    role="view-realm"
                    className="mt-6"
                >
                    <FormProvider {...form}>
                        <TextControl
                            name="name"
                            label={t("name")}
                            rules={{
                                required: t("required"),
                                validate: value =>
                                    policies.some(policy => policy.name === value)
                                        ? t("createClientProfileNameHelperText")
                                        : true
                            }}
                        />
                        <div className="space-y-2">
                            <Label htmlFor="kc-client-policy-description">{t("description")}</Label>
                            <Textarea
                                id="kc-client-policy-description"
                                data-testid="client-policy-description"
                                {...form.register("description")}
                                className="min-h-[80px]"
                            />
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button
                                type="submit"
                                data-testid="saveCreatePolicy"
                                disabled={!form.formState.isValid || isGlobalPolicy}
                            >
                                {t("save")}
                            </Button>
                            <Button
                                id="cancelCreatePolicy"
                                variant="ghost"
                                type="button"
                                onClick={() =>
                                    (showAddConditionsAndProfilesForm || policyName) &&
                                    !isGlobalPolicy
                                        ? reset()
                                        : navigate(
                                              toClientPolicies({
                                                  realm,
                                                  tab: "policies"
                                              })
                                          )
                                }
                                data-testid="cancelCreatePolicy"
                            >
                                {showAddConditionsAndProfilesForm && !isGlobalPolicy
                                    ? t("reload")
                                    : t("cancel")}
                            </Button>
                        </div>
                        {(showAddConditionsAndProfilesForm ||
                            form.formState.isSubmitted) && (
                            <>
                                <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                                    <h2 className="kc-conditions text-lg font-medium">
                                        {t("conditions")}
                                        <HelpItem
                                            helpText={t("conditionsHelp")}
                                            fieldLabelId="conditions"
                                        />
                                    </h2>
                                    {!isGlobalPolicy && (
                                        <Button
                                            id="addCondition"
                                            variant="ghost"
                                            className="kc-addCondition"
                                            data-testid="addCondition"
                                            asChild
                                        >
                                            <Link to={toNewClientPolicyCondition({ realm, policyName: policyName! })}>
                                                <Plus className="size-4 mr-1 inline" />
                                                {t("addCondition")}
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                                {policyConditions.length > 0 ? (
                                    <ul className="mt-2 space-y-1 border rounded-md divide-y" aria-label={t("conditions")}>
                                        {policyConditions.map((condition, idx) => (
                                            <li
                                                key={`list-item-${idx}`}
                                                id={condition.condition}
                                                data-testid="conditions-list-item"
                                                className="flex items-center justify-between gap-2 py-2 px-3"
                                            >
                                                <span data-testid="condition-type" className="flex items-center gap-2 min-w-0">
                                                    {Object.keys(condition.configuration!).length !== 0 ? (
                                                        <Link
                                                            key={condition.condition}
                                                            data-testid={`${condition.condition}-condition-link`}
                                                            to={toEditClientPolicyCondition({
                                                                realm,
                                                                conditionName: condition.condition!,
                                                                policyName: policyName
                                                            })}
                                                            className="kc-condition-link text-primary underline underline-offset-4"
                                                        >
                                                            {condition.condition}
                                                        </Link>
                                                    ) : (
                                                        condition.condition
                                                    )}
                                                    {conditionTypes?.map(type =>
                                                        type.id === condition.condition && (
                                                            <span key={type.id} className="flex items-center gap-1">
                                                                <HelpItem helpText={type.helpText} fieldLabelId={condition.condition} />
                                                                {!isGlobalPolicy && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        aria-label="remove-condition"
                                                                        className="kc-conditionType-trash-icon shrink-0"
                                                                        data-testid={`delete-${condition.condition}-condition`}
                                                                        onClick={() => {
                                                                            toggleDeleteConditionDialog();
                                                                            setConditionToDelete({ idx, name: type.id! });
                                                                        }}
                                                                    >
                                                                        <Trash className="size-4" />
                                                                    </Button>
                                                                )}
                                                            </span>
                                                        )
                                                    )}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <>
                                        <Separator className="my-4" />
                                        <h3 data-testid="no-conditions" className="kc-emptyConditions text-base font-medium text-muted-foreground">
                                            {t("emptyConditions")}
                                        </h3>
                                    </>
                                )}
                            </>
                        )}
{(showAddConditionsAndProfilesForm ||
                            form.formState.isSubmitted) && (
                            <>
                                <div className="flex items-center justify-between gap-4">
                                    <h2 className="kc-client-profiles text-lg font-semibold">
                                        {t("clientProfiles")}
                                        <HelpItem
                                            helpText={t("clientProfilesHelp")}
                                            fieldLabelId="clientProfiles"
                                        />
                                    </h2>
                                    {!isGlobalPolicy && (
                                        <Button
                                            id="addClientProfile"
                                            variant="link"
                                            className="kc-addClientProfile"
                                            data-testid="addClientProfile"
                                            onClick={toggleModal}
                                        >
                                            <Plus className="size-4" />
                                            {t("addClientProfile")}
                                        </Button>
                                    )}
                                </div>
                                {policyProfiles.length > 0 ? (
                                    <ul aria-label={t("profiles")} className="list-none divide-y divide-border rounded-md border border-border p-0">
                                        {policyProfiles.map((profile, idx) => (
                                            <li
                                                key={profile}
                                                id={`${profile}-profile-list-item`}
                                                data-testid="profile-list-item"
                                                aria-labelledby={`${profile}-profile-list-item`}
                                                className="flex items-center gap-2 px-3 py-2"
                                            >
                                                <div data-testid="profile-name" className="flex flex-1 flex-wrap items-center gap-1">
                                                    {profile && (
                                                        <Link
                                                            key={profile}
                                                            data-testid="profile-name-link"
                                                            to={toClientProfile({
                                                                realm,
                                                                profileName: profile
                                                            })}
                                                            className="kc-profile-link text-primary underline-offset-4 hover:underline"
                                                        >
                                                            {profile}
                                                        </Link>
                                                    )}
                                                    {policyProfiles
                                                        .filter(type => type === profile)
                                                        .map(type => (
                                                            <span key={type} className="inline-flex items-center gap-1">
                                                                <HelpItem
                                                                    helpText={
                                                                        clientProfiles.find(p => type === p.name)?.description
                                                                    }
                                                                    fieldLabelId={profile}
                                                                />
                                                                {!isGlobalPolicy && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="link"
                                                                        aria-label="remove-client-profile"
                                                                        className="p-0"
                                                                        data-testid="deleteClientProfileDropdown"
                                                                        onClick={() => {
                                                                            toggleDeleteProfileDialog();
                                                                            setProfileToDelete({ idx, name: type! });
                                                                        }}
                                                                    >
                                                                        <Trash className="kc-conditionType-trash-icon size-4" />
                                                                    </Button>
                                                                )}
                                                            </span>
                                                        ))}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <>
                                        <Separator />
                                        <h3 className="kc-emptyClientProfiles text-base font-medium text-muted-foreground">
                                            {t("emptyProfiles")}
                                        </h3>
                                    </>
                                )}
                            </>
                        )}
                    </FormProvider>
                </FormAccess>
            </section>
        </>
    );
}
