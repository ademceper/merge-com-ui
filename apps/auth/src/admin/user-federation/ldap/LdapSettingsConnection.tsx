/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/user-federation/ldap/LdapSettingsConnection.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type TestLdapConnectionRepresentation from "@keycloak/keycloak-admin-client/lib/defs/testLdapConnection";
import {
    HelpItem,
    KeycloakSelect,
    PasswordControl,
    SelectControl,
    SelectVariant,
    TextControl
} from "../../../shared/keycloak-ui-shared";
import { AlertVariant } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Label } from "@merge/ui/components/label";
import { Switch } from "@merge/ui/components/switch";
import { SelectOption } from "../../../shared/keycloak-ui-shared";
import { get, isEqual } from "lodash-es";
import { useState } from "react";
import { Controller, FormProvider, UseFormReturn, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { useAlerts } from "../../../shared/keycloak-ui-shared";
import { FormAccess } from "../../components/form/FormAccess";
import { WizardSectionHeader } from "../../components/wizard-section-header/WizardSectionHeader";
import { useRealm } from "../../context/realm-context/RealmContext";

export type LdapSettingsConnectionProps = {
    form: UseFormReturn;
    id?: string;
    showSectionHeading?: boolean;
    showSectionDescription?: boolean;
};

const testLdapProperties: Array<keyof TestLdapConnectionRepresentation> = [
    "connectionUrl",
    "bindDn",
    "bindCredential",
    "useTruststoreSpi",
    "connectionTimeout",
    "startTls",
    "authType"
];

type TestTypes = "testConnection" | "testAuthentication";

export const convertFormToSettings = (form: UseFormReturn) => {
    const settings: TestLdapConnectionRepresentation = {};

    testLdapProperties.forEach(key => {
        const value = get(form.getValues(), `config.${key}`);
        settings[key] = Array.isArray(value) ? value[0] : "";
    });

    return settings;
};

export const LdapSettingsConnection = ({
    form,
    id,
    showSectionHeading = false,
    showSectionDescription = false
}: LdapSettingsConnectionProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { realm } = useRealm();
    const { addAlert, addError } = useAlerts();
    const edit = !!id;

    const testLdap = async (testType: TestTypes) => {
        try {
            const settings = convertFormToSettings(form);
            await adminClient.realms.testLDAPConnection(
                { realm },
                { ...settings, action: testType, componentId: id }
            );
            addAlert(t("testSuccess"), AlertVariant.success);
        } catch (error) {
            addError("testError", error);
        }
    };

    const [isBindTypeDropdownOpen, setIsBindTypeDropdownOpen] = useState(false);

    const ldapBindType = useWatch({
        control: form.control,
        name: "config.authType",
        defaultValue: ["simple"]
    });

    return (
        <FormProvider {...form}>
            {showSectionHeading && (
                <WizardSectionHeader
                    title={t("connectionAndAuthenticationSettings")}
                    description={t("ldapConnectionAndAuthorizationSettingsDescription")}
                    showDescription={showSectionDescription}
                />
            )}
            <FormAccess role="manage-realm" isHorizontal>
                <TextControl
                    name="config.connectionUrl.0"
                    label={t("connectionURL")}
                    labelIcon={t("consoleDisplayConnectionUrlHelp")}
                    type="url"
                    rules={{
                        required: t("validateConnectionUrl")
                    }}
                />
                <div className="space-y-2">
                    <div className="flex items-center gap-1">
                        <Label htmlFor="kc-enable-start-tls">{t("enableStartTls")}</Label>
                        <HelpItem
                            helpText={t("enableStartTlsHelp")}
                            fieldLabelId="enableStartTls"
                        />
                    </div>
                    <Controller
                        name="config.startTls"
                        defaultValue={["false"]}
                        control={form.control}
                        render={({ field }) => (
                            <div className="flex items-center gap-2">
                                <Switch
                                    id={"kc-enable-start-tls"}
                                    data-testid="enable-start-tls"
                                    onCheckedChange={(value) => field.onChange([`${value}`])}
                                    checked={field.value[0] === "true"}
                                    aria-label={t("enableStartTls")}
                                />
                                <span className="text-sm">{field.value[0] === "true" ? t("on") : t("off")}</span>
                            </div>
                        )}
                    />
                </div>
                <SelectControl
                    id="useTruststoreSpi"
                    name="config.useTruststoreSpi[0]"
                    label={t("useTruststoreSpi")}
                    labelIcon={t("useTruststoreSpiHelp")}
                    controller={{
                        defaultValue: "always"
                    }}
                    options={[
                        { key: "always", value: t("always") },
                        { key: "never", value: t("never") }
                    ]}
                />
                <div className="space-y-2">
                    <div className="flex items-center gap-1">
                        <Label htmlFor="kc-connection-pooling">{t("connectionPooling")}</Label>
                        <HelpItem
                            helpText={t("connectionPoolingHelp")}
                            fieldLabelId="connectionPooling"
                        />
                    </div>
                    <Controller
                        name="config.connectionPooling"
                        defaultValue={["true"]}
                        control={form.control}
                        render={({ field }) => (
                            <div className="flex items-center gap-2">
                                <Switch
                                    id={"kc-connection-pooling"}
                                    data-testid="connection-pooling"
                                    onCheckedChange={(value) => field.onChange([`${value}`])}
                                    checked={field.value[0] === "true"}
                                    aria-label={t("connectionPooling")}
                                />
                                <span className="text-sm">{field.value[0] === "true" ? t("on") : t("off")}</span>
                            </div>
                        )}
                    />
                </div>
                <TextControl
                    name="config.connectionTimeout.0"
                    label={t("connectionTimeout")}
                    labelIcon={t("connectionTimeoutHelp")}
                    type="number"
                    min={0}
                />
                <div>
                    <Button
                        variant="secondary"
                        id="kc-test-connection-button"
                        data-testid="test-connection-button"
                        onClick={() => testLdap("testConnection")}
                    >
                        {t("testConnection")}
                    </Button>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-1">
                        <Label htmlFor="kc-bind-type">{t("bindType")} *</Label>
                        <HelpItem helpText={t("bindTypeHelp")} fieldLabelId="bindType" />
                    </div>
                    <Controller
                        name="config.authType[0]"
                        defaultValue="simple"
                        control={form.control}
                        render={({ field }) => (
                            <KeycloakSelect
                                toggleId="kc-bind-type"
                                onToggle={() =>
                                    setIsBindTypeDropdownOpen(!isBindTypeDropdownOpen)
                                }
                                isOpen={isBindTypeDropdownOpen}
                                onSelect={value => {
                                    field.onChange(value as string);
                                    setIsBindTypeDropdownOpen(false);
                                }}
                                selections={field.value}
                                variant={SelectVariant.single}
                                data-testid="ldap-bind-type"
                                aria-label={t("selectBindType")}
                            >
                                <SelectOption value="simple">simple</SelectOption>
                                <SelectOption value="none">none</SelectOption>
                            </KeycloakSelect>
                        )}
                    />
                </div>

                {isEqual(ldapBindType, ["simple"]) && (
                    <>
                        <TextControl
                            name="config.bindDn.0"
                            label={t("bindDn")}
                            labelIcon={t("bindDnHelp")}
                            rules={{
                                required: t("validateBindDn")
                            }}
                        />
                        <PasswordControl
                            name="config.bindCredential.0"
                            label={t("bindCredentials")}
                            labelIcon={t("bindCredentialsHelp")}
                            hasReveal={!edit}
                            rules={{
                                required: t("validateBindCredentials")
                            }}
                        />
                    </>
                )}
                <div>
                    <Button
                        variant="secondary"
                        id="kc-test-auth-button"
                        data-testid="test-auth-button"
                        onClick={() => testLdap("testAuthentication")}
                    >
                        {t("testAuthentication")}
                    </Button>
                </div>
            </FormAccess>
        </FormProvider>
    );
};
