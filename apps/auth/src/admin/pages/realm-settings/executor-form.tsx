import type { ConfigPropertyRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigInfoRepresentation";
import type ClientProfileRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientProfileRepresentation";
import type ComponentTypeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentTypeRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Label } from "@merge-rd/ui/components/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@merge-rd/ui/components/select";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    HelpItem
} from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../app/admin-client";
import { useServerInfo } from "../../app/providers/server-info/server-info-provider";
import { useParams } from "../../shared/lib/useParams";
import { DynamicComponents } from "../../shared/ui/dynamic/dynamic-components";
import { FormAccess } from "../../shared/ui/form/form-access";
import { useClientProfiles } from "./api/use-client-profiles";
import { type ClientProfileParams, toClientProfile, type ExecutorParams } from "../../shared/lib/routes/realm-settings";

type ExecutorForm = {
    config?: object;
    executor: string;
};

const defaultValues: ExecutorForm = {
    config: {},
    executor: ""
};

export default function ExecutorForm() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { realm, profileName } = useParams<ClientProfileParams>();
    const { executorName } = useParams<ExecutorParams>();
    const [selectExecutorTypeOpen, setSelectExecutorTypeOpen] = useState(false);
    const serverInfo = useServerInfo();
    const executorTypes =
        serverInfo.componentTypes?.[
            "org.keycloak.services.clientpolicy.executor.ClientPolicyExecutorProvider"
        ];
    const [executors, setExecutors] = useState<ComponentTypeRepresentation[]>([]);
    const [executorProperties, setExecutorProperties] = useState<
        ConfigPropertyRepresentation[]
    >([]);
    const [globalProfiles, setGlobalProfiles] = useState<ClientProfileRepresentation[]>(
        []
    );
    const [profiles, setProfiles] = useState<ClientProfileRepresentation[]>([]);
    const form = useForm({ defaultValues });
    const { control, reset, handleSubmit } = form;
    const editMode = !!executorName;

    const setupForm = (profiles: ClientProfileRepresentation[]) => {
        const profile = profiles.find(profile => profile.name === profileName);
        const executor = profile?.executors?.find(
            executor => executor.executor === executorName
        );
        if (executor) reset({ config: executor.configuration });
    };

    const { data: allProfilesData } = useClientProfiles();

    useEffect(() => {
        if (allProfilesData) {
            setGlobalProfiles(allProfilesData.globalProfiles!);
            setProfiles(allProfilesData.profiles!);

            setupForm(allProfilesData.profiles!);
            setupForm(allProfilesData.globalProfiles!);
        }
    }, [allProfilesData]);

    const save = async () => {
        const formValues = form.getValues();
        const updatedProfiles = profiles.map(profile => {
            if (profile.name !== profileName) {
                return profile;
            }

            const executors = (profile.executors ?? []).concat({
                executor: formValues.executor,
                configuration: formValues.config || {}
            });

            if (editMode) {
                const profileExecutor = profile.executors!.find(
                    executor => executor.executor === executorName
                );
                profileExecutor!.configuration = {
                    ...profileExecutor!.configuration,
                    ...formValues.config
                };
            }

            if (editMode) {
                return profile;
            }
            return {
                ...profile,
                executors
            };
        });
        try {
            await adminClient.clientPolicies.createProfiles({
                profiles: updatedProfiles,
                globalProfiles: globalProfiles
            });
            toast.success(
                editMode ? t("updateExecutorSuccess") : t("addExecutorSuccess")
            );

            navigate({ to: toClientProfile({ realm, profileName }) as string });
        } catch (error) {
            toast.error(
                t(editMode ? "updateExecutorError" : "addExecutorError", {
                    error: getErrorMessage(error)
                }),
                { description: getErrorDescription(error) }
            );
        }
    };

    const globalProfile = globalProfiles.find(
        globalProfile => globalProfile.name === profileName
    );

    const profileExecutorType = executorTypes?.find(
        executor => executor.id === executorName
    );

    const editedProfileExecutors =
        profileExecutorType?.properties.map<ConfigPropertyRepresentation>(property => {
            const globalDefaultValues = editMode ? property.defaultValue : "";
            return {
                ...property,
                defaultValue: globalDefaultValues
            };
        });

    return (
        <div className="p-6">
            <FormAccess
                isHorizontal
                role="manage-realm"
                className="mt-6"
                isReadOnly={!!globalProfile}
            >
                <div className="space-y-2">
                    <div className="flex items-center gap-1">
                        <Label htmlFor="kc-executorType">{t("executorType")}</Label>
                        {executors.length > 0 && executors[0].helpText! !== "" ? (
                            <HelpItem
                                helpText={executors[0].helpText}
                                fieldLabelId="executorTypeHelpText"
                            />
                        ) : editMode ? (
                            <HelpItem
                                helpText={profileExecutorType?.helpText}
                                fieldLabelId="executorTypeHelpText"
                            />
                        ) : undefined}
                    </div>
                    <Controller
                        name="executor"
                        defaultValue=""
                        control={control}
                        render={({ field }) => (
                            <Select
                                open={selectExecutorTypeOpen}
                                onOpenChange={setSelectExecutorTypeOpen}
                                value={editMode ? executorName : (field.value ?? "")}
                                onValueChange={value => {
                                    reset({
                                        ...defaultValues,
                                        executor: value
                                    });
                                    const selectedExecutor = executorTypes?.filter(
                                        type => type.id === value
                                    );
                                    setExecutors(selectedExecutor ?? []);
                                    setExecutorProperties(
                                        selectedExecutor?.[0].properties ?? []
                                    );
                                    setSelectExecutorTypeOpen(false);
                                }}
                                data-testid="executorType-select"
                                aria-label={t("executorType")}
                                disabled={editMode}
                            >
                                <SelectTrigger id="kc-executor">
                                    <SelectValue placeholder="Select an executor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {executorTypes?.map(option => (
                                        <SelectItem
                                            data-testid={option.id}
                                            key={option.id}
                                            value={option.id ?? ""}
                                        >
                                            {option.id}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                <FormProvider {...form}>
                    <DynamicComponents
                        properties={
                            editMode ? editedProfileExecutors! : executorProperties
                        }
                    />
                </FormProvider>
                {!globalProfile && (
                    <div className="flex gap-2">
                        <Button
                            onClick={() => handleSubmit(save)()}
                            data-testid="addExecutor-saveBtn"
                        >
                            {editMode ? t("save") : t("add")}
                        </Button>
                        <Button
                            variant="ghost"
                            data-testid="addExecutor-cancelBtn"
                            asChild
                        >
                            <Link to={toClientProfile({ realm, profileName }) as string}>
                                {t("cancel")}
                            </Link>
                        </Button>
                    </div>
                )}
            </FormAccess>
            {editMode && globalProfile && (
                <div className="kc-backToProfile">
                    <Button asChild>
                        <Link to={toClientProfile({ realm, profileName }) as string}>
                            {t("back")}
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
