/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/user-federation/kerberos/KerberosSettingsRequired.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { HelpItem, SelectControl, TextControl } from "../../../shared/keycloak-ui-shared";
import { Switch } from "@merge/ui/components/switch";
import { FormLabel } from "../../../shared/keycloak-ui-shared";
import { isEqual } from "lodash-es";
import { useEffect } from "react";
import { Controller, FormProvider, UseFormReturn, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormAccess } from "../../components/form/FormAccess";
import { WizardSectionHeader } from "../../components/wizard-section-header/WizardSectionHeader";
import { useRealm } from "../../context/realm-context/RealmContext";

export type KerberosSettingsRequiredProps = {
    form: UseFormReturn;
    showSectionHeading?: boolean;
    showSectionDescription?: boolean;
};

export const KerberosSettingsRequired = ({
    form,
    showSectionHeading = false,
    showSectionDescription = false
}: KerberosSettingsRequiredProps) => {
    const { t } = useTranslation();
    const { realm, realmRepresentation } = useRealm();

    const allowPassAuth = useWatch({
        control: form.control,
        name: "config.allowPasswordAuthentication"
    });

    useEffect(() => form.setValue("parentId", realmRepresentation?.id), []);

    return (
        <FormProvider {...form}>
            {showSectionHeading && (
                <WizardSectionHeader
                    title={t("requiredSettings")}
                    description={t("kerberosRequiredSettingsDescription")}
                    showDescription={showSectionDescription}
                />
            )}

            {/* Required settings */}
            <FormAccess role="manage-realm" isHorizontal>
                {/* These hidden fields are required so data object written back matches data retrieved */}
                <input
                    type="hidden"
                    defaultValue="kerberos"
                    {...form.register("providerId")}
                />
                <input
                    type="hidden"
                    defaultValue="org.keycloak.storage.UserStorageProvider"
                    {...form.register("providerType")}
                />
                <input
                    type="hidden"
                    defaultValue={realm}
                    {...form.register("parentId")}
                />
                <TextControl
                    name="name"
                    label={t("uiDisplayName")}
                    labelIcon={t("uiDisplayNameHelp")}
                    rules={{
                        required: t("validateName")
                    }}
                />
                <TextControl
                    name="config.kerberosRealm.0"
                    label={t("kerberosRealm")}
                    labelIcon={t("kerberosRealmHelp")}
                    rules={{
                        required: t("validateRealm")
                    }}
                />
                <TextControl
                    name="config.serverPrincipal.0"
                    label={t("serverPrincipal")}
                    labelIcon={t("serverPrincipalHelp")}
                    rules={{
                        required: t("validateServerPrincipal")
                    }}
                />
                <TextControl
                    name="config.keyTab.0"
                    label={t("keyTab")}
                    labelIcon={t("keyTabHelp")}
                    rules={{
                        required: t("validateKeyTab")
                    }}
                />
                <FormLabel
                    name="kc-debug"
                    label={t("debug")}
                    labelIcon={
                        <HelpItem helpText={t("debugHelp")} fieldLabelId="debug" />
                    }
                    hasNoPaddingTop
                >
                    <Controller
                        name="config.debug"
                        defaultValue={["false"]}
                        control={form.control}
                        render={({ field }) => (
                            <Switch
                                id="kc-debug"
                                data-testid="debug"
                                checked={field.value?.[0] === "true"}
                                onCheckedChange={(value) => field.onChange([`${value}`])}
                                aria-label={t("debug")}
                            />
                        )}
                    />
                </FormLabel>
                <FormLabel
                    name="kc-allow-password-authentication"
                    label={t("allowPasswordAuthentication")}
                    labelIcon={
                        <HelpItem
                            helpText={t("allowPasswordAuthenticationHelp")}
                            fieldLabelId="allowPasswordAuthentication"
                        />
                    }
                    hasNoPaddingTop
                >
                    <Controller
                        name="config.allowPasswordAuthentication"
                        defaultValue={["false"]}
                        control={form.control}
                        render={({ field }) => (
                            <Switch
                                id="kc-allow-password-authentication"
                                data-testid="allow-password-authentication"
                                checked={field.value?.[0] === "true"}
                                onCheckedChange={(value) => field.onChange([`${value}`])}
                                aria-label={t("allowPasswordAuthentication")}
                            />
                        )}
                    />
                </FormLabel>
                {isEqual(allowPassAuth, ["true"]) ? (
                    <SelectControl
                        name="config.editMode[0]"
                        label={t("editMode")}
                        labelIcon={t("editModeKerberosHelp")}
                        controller={{
                            rules: { required: t("required") },
                            defaultValue: "READ_ONLY"
                        }}
                        options={["READ_ONLY", "UNSYNCED"]}
                    />
                ) : null}
                <FormLabel
                    name="kc-update-first-login"
                    label={t("updateFirstLogin")}
                    labelIcon={
                        <HelpItem
                            helpText={t("updateFirstLoginHelp")}
                            fieldLabelId="updateFirstLogin"
                        />
                    }
                    hasNoPaddingTop
                >
                    <Controller
                        name="config.updateProfileFirstLogin"
                        defaultValue={["false"]}
                        control={form.control}
                        render={({ field }) => (
                            <Switch
                                id="kc-update-first-login"
                                data-testid="update-first-login"
                                checked={field.value?.[0] === "true"}
                                onCheckedChange={(value) => field.onChange([`${value}`])}
                                aria-label={t("updateFirstLogin")}
                            />
                        )}
                    />
                </FormLabel>
            </FormAccess>
        </FormProvider>
    );
};
