/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/authentication/components/RequiredActionConfigModal.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import RequiredActionConfigInfoRepresentation from "@keycloak/keycloak-admin-client/lib/defs/requiredActionConfigInfoRepresentation";
import RequiredActionConfigRepresentation from "@keycloak/keycloak-admin-client/lib/defs/requiredActionConfigRepresentation";
import type RequiredActionProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderRepresentation";
import {
    AlertVariant,
    isUserProfileError,
    setUserProfileServerError,
    useAlerts,
    useFetch
} from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@merge/ui/components/dialog";
import { Trash } from "@phosphor-icons/react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { DynamicComponents } from "../../components/dynamic/DynamicComponents";
import { convertFormValuesToObject, convertToFormValues } from "../../util";

type RequiredActionConfigModalForm = {
    // alias: string;
    config: { [index: string]: string };
};

type RequiredActionConfigModalProps = {
    requiredAction: RequiredActionProviderRepresentation;
    onClose: () => void;
};

export const RequiredActionConfigModal = ({
    requiredAction,
    onClose
}: RequiredActionConfigModalProps) => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const { addAlert, addError } = useAlerts();

    const [configDescription, setConfigDescription] =
        useState<RequiredActionConfigInfoRepresentation>();

    const form = useForm<RequiredActionConfigModalForm>();
    const { setValue, handleSubmit } = form;

    // // default config all required actions should have
    // const defaultConfigProperties = [];

    const setupForm = (config?: RequiredActionConfigRepresentation) => {
        convertToFormValues(config || {}, setValue);
    };

    useFetch(
        async () => {
            const configDescription =
                await adminClient.authenticationManagement.getRequiredActionConfigDescription(
                    {
                        alias: requiredAction.alias!
                    }
                );

            const config =
                await adminClient.authenticationManagement.getRequiredActionConfig({
                    alias: requiredAction.alias!
                });

            // merge default and fetched config properties
            configDescription.properties = [
                //...defaultConfigProperties!,
                ...configDescription.properties!
            ];

            return { configDescription, config };
        },
        ({ configDescription, config }) => {
            setConfigDescription(configDescription);
            setupForm(config);
        },
        []
    );

    const save = async (saved: RequiredActionConfigModalForm) => {
        const newConfig = convertFormValuesToObject(saved);
        try {
            await adminClient.authenticationManagement.updateRequiredActionConfig(
                { alias: requiredAction.alias! },
                newConfig
            );
            setupForm(newConfig);
            addAlert(t("configSaveSuccess"), AlertVariant.success);
            onClose();
        } catch (error) {
            if (isUserProfileError(error)) {
                setUserProfileServerError(
                    error,
                    (name: string | number, error: unknown) => {
                        // TODO: Does not set set the error message to the field, yet.
                        // Still, this will do all front end replacement and translation of keys.
                        addError("configSaveError", (error as any).message);
                    },
                    t
                );
            } else {
                addError("configSaveError", error);
            }
        }
    };

    return (
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("requiredActionConfig", { name: requiredAction.name })}</DialogTitle>
                </DialogHeader>
                <form id="required-action-config-form" onSubmit={handleSubmit(save)}>
                    <FormProvider {...form}>
                        <DynamicComponents
                            stringify
                            properties={configDescription?.properties || []}
                        />
                    </FormProvider>
                    <div className="flex gap-2 mt-4">
                        <Button data-testid="save" type="submit">
                            {t("save")}
                        </Button>
                        <Button
                            data-testid="cancel"
                            variant="link"
                            onClick={onClose}
                        >
                            {t("cancel")}
                        </Button>
                        <Button
                            className="ml-auto"
                            data-testid="clear"
                            variant="link"
                            onClick={async () => {
                                await adminClient.authenticationManagement.removeRequiredActionConfig(
                                    {
                                        alias: requiredAction.alias!
                                    }
                                );
                                form.reset({});
                                onClose();
                            }}
                        >
                            {t("clear")} <Trash className="size-4" />
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
