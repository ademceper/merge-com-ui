/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/user-federation/UserFederationKerberosWizard.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Button } from "@merge/ui/components/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { KerberosSettingsRequired } from "./kerberos/KerberosSettingsRequired";
import { SettingsCache } from "./shared/SettingsCache";
import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { useForm } from "react-hook-form";

export const UserFederationKerberosWizard = () => {
    const { t } = useTranslation();
    const form = useForm<ComponentRepresentation>({ mode: "onChange" });
    const [step, setStep] = useState(0);

    const steps = [
        { id: "kerberosRequiredSettingsStep", name: t("requiredSettings") },
        { id: "cacheSettingsStep", name: t("cacheSettings") }
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
                {step === 0 && (
                    <KerberosSettingsRequired form={form} showSectionHeading showSectionDescription />
                )}
                {step === 1 && (
                    <SettingsCache form={form} showSectionHeading showSectionDescription />
                )}
            </div>
            <div className="flex gap-2 p-4 border-t">
                <Button variant="secondary" onClick={() => setStep(s => s - 1)} disabled={isFirst}>
                    {t("back")}
                </Button>
                <Button onClick={() => setStep(s => s + 1)} disabled={isLast}>
                    {isLast ? t("finish") : t("next")}
                </Button>
                <Button variant="link">{t("cancel")}</Button>
            </div>
        </div>
    );
};
