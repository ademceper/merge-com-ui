/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/user-federation/ldap/LdapSettingsKerberosIntegration.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Controller, FormProvider, UseFormReturn, useWatch } from "react-hook-form";
import { Switch } from "@merge/ui/components/switch";
import { FormLabel } from "../../../shared/keycloak-ui-shared";
import { useTranslation } from "react-i18next";
import { HelpItem, TextControl } from "../../../shared/keycloak-ui-shared";
import { FormAccess } from "../../components/form/FormAccess";
import { WizardSectionHeader } from "../../components/wizard-section-header/WizardSectionHeader";

export type LdapSettingsKerberosIntegrationProps = {
    form: UseFormReturn;
    showSectionHeading?: boolean;
    showSectionDescription?: boolean;
};

export const LdapSettingsKerberosIntegration = ({
    form,
    showSectionHeading = false,
    showSectionDescription = false
}: LdapSettingsKerberosIntegrationProps) => {
    const { t } = useTranslation();

    const allowKerberosAuth: [string] = useWatch({
        control: form.control,
        name: "config.allowKerberosAuthentication",
        defaultValue: ["false"]
    });

    return (
        <FormProvider {...form}>
            {showSectionHeading && (
                <WizardSectionHeader
                    title={t("kerberosIntegration")}
                    description={t("ldapKerberosSettingsDescription")}
                    showDescription={showSectionDescription}
                />
            )}

            <FormAccess role="manage-realm" isHorizontal>
                <FormLabel
                    name="kc-allow-kerberos-authentication"
                    label={t("allowKerberosAuthentication")}
                    labelIcon={
                        <HelpItem
                            helpText={t("allowKerberosAuthenticationHelp")}
                            fieldLabelId="allowKerberosAuthentication"
                        />
                    }
                    hasNoPaddingTop
                >
                    <Controller
                        name="config.allowKerberosAuthentication"
                        defaultValue={["false"]}
                        control={form.control}
                        render={({ field }) => (
                            <Switch
                                id="kc-allow-kerberos-authentication"
                                data-testid="allow-kerberos-auth"
                                checked={field.value[0] === "true"}
                                onCheckedChange={(value) => field.onChange([`${value}`])}
                                aria-label={t("allowKerberosAuthentication")}
                            />
                        )}
                    />
                </FormLabel>

                {allowKerberosAuth[0] === "true" && (
                    <>
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
                        <TextControl
                            name="config.krbPrincipalAttribute.0"
                            label={t("krbPrincipalAttribute")}
                            labelIcon={t("krbPrincipalAttributeHelp")}
                        />

                        <FormLabel
                            name="kc-debug"
                            label={t("debug")}
                            labelIcon={
                                <HelpItem
                                    helpText={t("debugHelp")}
                                    fieldLabelId="debug"
                                />
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
                                        checked={field.value[0] === "true"}
                                        onCheckedChange={(value) =>
                                            field.onChange([`${value}`])
                                        }
                                        aria-label={t("debug")}
                                    />
                                )}
                            />
                        </FormLabel>
                    </>
                )}
                <FormLabel
                    name="kc-use-kerberos-password-authentication"
                    label={t("useKerberosForPasswordAuthentication")}
                    labelIcon={
                        <HelpItem
                            helpText={t("useKerberosForPasswordAuthenticationHelp")}
                            fieldLabelId="useKerberosForPasswordAuthentication"
                        />
                    }
                    hasNoPaddingTop
                >
                    <Controller
                        name="config.useKerberosForPasswordAuthentication"
                        defaultValue={["false"]}
                        control={form.control}
                        render={({ field }) => (
                            <Switch
                                id="kc-use-kerberos-password-authentication"
                                data-testid="use-kerberos-pw-auth"
                                checked={field.value[0] === "true"}
                                onCheckedChange={(value) => field.onChange([`${value}`])}
                                aria-label={t("useKerberosForPasswordAuthentication")}
                            />
                        )}
                    />
                </FormLabel>
            </FormAccess>
        </FormProvider>
    );
};
