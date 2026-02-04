import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { Button } from "@merge/ui/components/button";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import useIsFeatureEnabled, { Feature } from "../utils/useIsFeatureEnabled";
import { LdapSettingsAdvanced } from "./ldap/LdapSettingsAdvanced";
import { LdapSettingsConnection } from "./ldap/LdapSettingsConnection";
import { LdapSettingsGeneral } from "./ldap/LdapSettingsGeneral";
import { LdapSettingsKerberosIntegration } from "./ldap/LdapSettingsKerberosIntegration";
import { LdapSettingsSearching } from "./ldap/LdapSettingsSearching";
import { LdapSettingsSynchronization } from "./ldap/LdapSettingsSynchronization";
import { SettingsCache } from "./shared/SettingsCache";

export const UserFederationLdapWizard = () => {
    const form = useForm<ComponentRepresentation>();
    const { t } = useTranslation();
    const isFeatureEnabled = useIsFeatureEnabled();
    const [step, setStep] = useState(0);

    const steps = [
        { id: "ldapRequiredSettingsStep", name: t("requiredSettings") },
        { id: "ldapConnectionSettingsStep", name: t("connectionAndAuthenticationSettings") },
        { id: "ldapSearchingSettingsStep", name: t("ldapSearchingAndUpdatingSettings") },
        { id: "ldapSynchronizationSettingsStep", name: t("synchronizationSettings") },
        ...(isFeatureEnabled(Feature.Kerberos)
            ? [{ id: "ldapKerberosIntegrationSettingsStep", name: t("kerberosIntegration") }]
            : []),
        { id: "ldapCacheSettingsStep", name: t("cacheSettings") },
        { id: "ldapAdvancedSettingsStep", name: t("advancedSettings") }
    ];

    const isLast = step === steps.length - 1;
    const isFirst = step === 0;

    return (
        <div className="flex flex-col h-full">
            <div className="flex gap-2 p-4 border-b">
                {steps.map((s, i) => (
                    <Button
                        key={s.id}
                        variant={i === step ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStep(i)}
                    >
                        {s.name}
                    </Button>
                ))}
            </div>
            <div className="flex-1 overflow-auto p-6">
                {steps[step]?.id === "ldapRequiredSettingsStep" && (
                    <LdapSettingsGeneral form={form} showSectionHeading showSectionDescription />
                )}
                {steps[step]?.id === "ldapConnectionSettingsStep" && (
                    <LdapSettingsConnection form={form} showSectionHeading showSectionDescription />
                )}
                {steps[step]?.id === "ldapSearchingSettingsStep" && (
                    <LdapSettingsSearching form={form} showSectionHeading showSectionDescription />
                )}
                {steps[step]?.id === "ldapSynchronizationSettingsStep" && (
                    <LdapSettingsSynchronization form={form} showSectionHeading showSectionDescription />
                )}
                {steps[step]?.id === "ldapKerberosIntegrationSettingsStep" && (
                    <LdapSettingsKerberosIntegration form={form} showSectionHeading showSectionDescription />
                )}
                {steps[step]?.id === "ldapCacheSettingsStep" && (
                    <SettingsCache form={form} showSectionHeading showSectionDescription />
                )}
                {steps[step]?.id === "ldapAdvancedSettingsStep" && (
                    <LdapSettingsAdvanced form={form} showSectionHeading showSectionDescription />
                )}
            </div>
            <div className="flex gap-2 p-4 border-t">
                <Button variant="secondary" onClick={() => setStep(s => s - 1)} disabled={isFirst}>
                    {t("back")}
                </Button>
                <Button onClick={() => setStep(s => s + 1)} disabled={isLast}>
                    {isLast ? t("finish") : t("next")}
                </Button>
                {!isFirst && !isLast && (
                    <Button variant="link">{t("skipCustomizationAndFinish")}</Button>
                )}
                <Button variant="link">{t("cancel")}</Button>
            </div>
        </div>
    );
};
