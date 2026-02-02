/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/ClientProfileForm.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type ClientProfileRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientProfileRepresentation";
import type ClientProfilesRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientProfilesRepresentation";
import {
    HelpItem,
    TextAreaControl,
    TextControl,
    useAlerts,
    useFetch
} from "../../shared/keycloak-ui-shared";
import { AlertVariant } from "../../shared/keycloak-ui-shared";
import { Badge } from "@merge/ui/components/badge";
import { Button } from "@merge/ui/components/button";
import { DropdownMenuItem } from "@merge/ui/components/dropdown-menu";
import { Label } from "@merge/ui/components/label";
import { Separator } from "@merge/ui/components/separator";
import { Plus, Trash } from "@phosphor-icons/react";
import { Fragment, useMemo, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { FormAccess } from "../components/form/FormAccess";
import { KeycloakSpinner } from "../../shared/keycloak-ui-shared";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { useServerInfo } from "../context/server-info/ServerInfoProvider";
import { useParams } from "../utils/useParams";
import { toAddExecutor } from "./routes/AddExecutor";
import { toClientPolicies } from "./routes/ClientPolicies";
import { ClientProfileParams, toClientProfile } from "./routes/ClientProfile";
import { toExecutor } from "./routes/Executor";


type ClientProfileForm = Required<ClientProfileRepresentation>;

const defaultValues: ClientProfileForm = {
    name: "",
    description: "",
    executors: []
};

export default function ClientProfileForm() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const form = useForm<ClientProfileForm>({
        defaultValues,
        mode: "onChange"
    });

    const {
        handleSubmit,
        setValue,
        getValues,
        formState: { isDirty },
        control
    } = form;

    const { fields: profileExecutors, remove } = useFieldArray({
        name: "executors",
        control
    });

    const { addAlert, addError } = useAlerts();
    const [profiles, setProfiles] = useState<ClientProfilesRepresentation>();
    const [isGlobalProfile, setIsGlobalProfile] = useState(false);
    const { realm, profileName } = useParams<ClientProfileParams>();
    const serverInfo = useServerInfo();
    const executorTypes = useMemo(
        () =>
            serverInfo.componentTypes?.[
                "org.keycloak.services.clientpolicy.executor.ClientPolicyExecutorProvider"
            ],
        []
    );
    const [executorToDelete, setExecutorToDelete] = useState<{
        idx: number;
        name: string;
    }>();
    const editMode = profileName ? true : false;
    const [key, setKey] = useState(0);
    const reload = () => setKey(key + 1);

    useFetch(
        () => adminClient.clientPolicies.listProfiles({ includeGlobalProfiles: true }),
        profiles => {
            setProfiles({
                globalProfiles: profiles.globalProfiles,
                profiles: profiles.profiles?.filter(p => p.name !== profileName)
            });
            const globalProfile = profiles.globalProfiles?.find(
                p => p.name === profileName
            );
            const profile = profiles.profiles?.find(p => p.name === profileName);
            setIsGlobalProfile(globalProfile !== undefined);
            setValue("name", globalProfile?.name ?? profile?.name ?? "");
            setValue(
                "description",
                globalProfile?.description ?? profile?.description ?? ""
            );
            setValue("executors", globalProfile?.executors ?? profile?.executors ?? []);
        },
        [key]
    );

    const save = async (form: ClientProfileForm) => {
        const updatedProfiles = form;

        try {
            await adminClient.clientPolicies.createProfiles({
                ...profiles,
                profiles: [...(profiles?.profiles || []), updatedProfiles]
            });

            addAlert(
                editMode
                    ? t("updateClientProfileSuccess")
                    : t("createClientProfileSuccess"),
                AlertVariant.success
            );

            navigate(toClientProfile({ realm, profileName: form.name }));
        } catch (error) {
            addError(
                editMode ? "updateClientProfileError" : "createClientProfileError",
                error
            );
        }
    };

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: executorToDelete?.name!
            ? t("deleteExecutorProfileConfirmTitle")
            : t("deleteClientProfileConfirmTitle"),
        messageKey: executorToDelete?.name!
            ? t("deleteExecutorProfileConfirm", {
                  executorName: executorToDelete.name!
              })
            : t("deleteClientProfileConfirm", {
                  profileName
              }),
        continueButtonLabel: t("delete"),
        continueButtonVariant: "destructive",

        onConfirm: async () => {
            if (executorToDelete?.name!) {
                remove(executorToDelete.idx);
                try {
                    await adminClient.clientPolicies.createProfiles({
                        ...profiles,
                        profiles: [...(profiles!.profiles || []), getValues()]
                    });
                    addAlert(t("deleteExecutorSuccess"), AlertVariant.success);
                    navigate(toClientProfile({ realm, profileName }));
                } catch (error) {
                    addError("deleteExecutorError", error);
                }
            } else {
                try {
                    await adminClient.clientPolicies.createProfiles(profiles);
                    addAlert(t("deleteClientSuccess"), AlertVariant.success);
                    navigate(toClientPolicies({ realm, tab: "profiles" }));
                } catch (error) {
                    addError("deleteClientError", error);
                }
            }
        }
    });

    if (!profiles) {
        return <KeycloakSpinner />;
    }

    return (
        <>
            <DeleteConfirm />
            <ViewHeader
                titleKey={editMode ? profileName : t("newClientProfile")}
                badges={[
                    {
                        id: "global-client-profile-badge",
                        text: isGlobalProfile ? (
                            <Label color="blue">{t("global")}</Label>
                        ) : (
                            ""
                        )
                    }
                ]}
                divider
                dropdownItems={
                    editMode && !isGlobalProfile
                        ? [
                              <DropdownMenuItem
                                  key="delete"
                                  data-testid="deleteClientProfileDropdown"
                                  onClick={toggleDeleteDialog}
                              >
                                  {t("deleteClientProfile")}
                              </DropdownMenuItem>
                          ]
                        : undefined
                }
            />
            <section className="py-6 bg-muted/30">
                <FormProvider {...form}>
                    <FormAccess isHorizontal role="view-realm" className="mt-6">
                        <TextControl
                            name="name"
                            label={t("newClientProfileName")}
                            helperText={t("createClientProfileNameHelperText")}
                            readOnly={isGlobalProfile}
                            rules={{
                                required: t("required")
                            }}
                        />
                        <TextAreaControl
                            name="description"
                            label={t("description")}
                            readOnly={isGlobalProfile}
                        />
                        <div className="flex gap-2 mt-4">
                            {!isGlobalProfile && (
                                <Button
                                    onClick={() => handleSubmit(save)()}
                                    data-testid="saveCreateProfile"
                                    disabled={!isDirty}
                                >
                                    {t("save")}
                                </Button>
                            )}
                            {editMode && !isGlobalProfile && (
                                <Button
                                    id="reloadProfile"
                                    variant="ghost"
                                    data-testid="reloadProfile"
                                    disabled={!isDirty}
                                    onClick={reload}
                                >
                                    {t("reload")}
                                </Button>
                            )}
                            {!editMode && !isGlobalProfile && (
                                <Button
                                    id="cancelCreateProfile"
                                    variant="ghost"
                                    data-testid="cancelCreateProfile"
                                    asChild
                                >
                                    <Link to={toClientPolicies({ realm, tab: "profiles" })}>
                                        {t("cancel")}
                                    </Link>
                                </Button>
                            )}
                        </div>
                        {editMode && (
                            <>
                                <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                                    <h2 className="kc-executors text-lg font-medium">
                                        {t("executors")}
                                        <HelpItem helpText={t("executorsHelpText")} fieldLabelId="executors" />
                                    </h2>
                                    {!isGlobalProfile && (
                                        <Button
                                            id="addExecutor"
                                            variant="ghost"
                                            className="kc-addExecutor"
                                            data-testid="addExecutor"
                                            asChild
                                        >
                                            <Link to={toAddExecutor({ realm, profileName })}>
                                                <Plus className="size-4 mr-1 inline" />
                                                {t("addExecutor")}
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                                {profileExecutors.length > 0 && (
                                    <>
                                        <ul className="mt-2 space-y-1 border rounded-md divide-y" aria-label={t("executors")}>
                                            {profileExecutors.map((executor, idx) => (
                                                <li key={executor.executor} id={executor.executor} className="flex items-center justify-between gap-2 py-2 px-3">
                                                    <span data-testid="executor-type" className="flex items-center gap-2 min-w-0">
                                                        {executor.configuration ? (
                                                            <Button variant="ghost" className="p-0 h-auto font-normal text-primary underline" data-testid="editExecutor" asChild>
                                                                <Link to={toExecutor({ realm, profileName, executorName: executor.executor! })}>
                                                                    {executor.executor}
                                                                </Link>
                                                            </Button>
                                                        ) : (
                                                            <span className="kc-unclickable-executor">{executor.executor}</span>
                                                        )}
                                                        {executorTypes?.filter(type => type.id === executor.executor).map(type => (
                                                            <Fragment key={type.id}>
                                                                <HelpItem helpText={type.helpText} fieldLabelId="executorTypeTextHelpText" />
                                                                {!isGlobalProfile && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        data-testid={`deleteExecutor-${type.id}`}
                                                                        className="kc-executor-trash-icon shrink-0"
                                                                        onClick={() => {
                                                                            toggleDeleteDialog();
                                                                            setExecutorToDelete({ idx, name: type.id });
                                                                        }}
                                                                        aria-label={t("remove")}
                                                                    >
                                                                        <Trash className="size-4" />
                                                                    </Button>
                                                                )}
                                                            </Fragment>
                                                        ))}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                        {isGlobalProfile && (
                                            <Button id="backToClientPolicies" className="kc-backToPolicies mt-4" data-testid="backToClientPolicies" asChild>
                                                <Link to={toClientPolicies({ realm, tab: "profiles" })}>{t("back")}</Link>
                                            </Button>
                                        )}
                                    </>
                                )}
                                {profileExecutors.length === 0 && (
                                    <>
                                        <Separator className="my-4" />
                                        <h3 className="kc-emptyExecutors text-base font-medium text-muted-foreground">
                                            {t("emptyExecutors")}
                                        </h3>
                                    </>
                                )}
                            </>
                        )}
                    </FormAccess>
                </FormProvider>
            </section>
        </>
    );
}
