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

import {
    useWizardContext,
    Wizard,
    WizardFooter,
    WizardStep
} from "@patternfly/react-core/";
import { useTranslation } from "react-i18next";

import { KerberosSettingsRequired } from "./kerberos/KerberosSettingsRequired";
import { SettingsCache } from "./shared/SettingsCache";
import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { useForm } from "react-hook-form";

const UserFedKerberosFooter = () => {
    const { t } = useTranslation();
    const { activeStep, goToNextStep, goToPrevStep, close } = useWizardContext();
    return (
        <WizardFooter
            activeStep={activeStep}
            onNext={goToNextStep}
            onBack={goToPrevStep}
            onClose={close}
            isBackDisabled={activeStep.index === 1}
            backButtonText={t("back")}
            nextButtonText={t("next")}
            cancelButtonText={t("cancel")}
        />
    );
};

export const UserFederationKerberosWizard = () => {
    const { t } = useTranslation();
    const form = useForm<ComponentRepresentation>({ mode: "onChange" });

    return (
        <Wizard height="100%" footer={<UserFedKerberosFooter />}>
            <WizardStep name={t("requiredSettings")} id="kerberosRequiredSettingsStep">
                <KerberosSettingsRequired
                    form={form}
                    showSectionHeading
                    showSectionDescription
                />
            </WizardStep>
            <WizardStep
                name={t("cacheSettings")}
                id="cacheSettingsStep"
                footer={{
                    backButtonText: t("back"),
                    nextButtonText: t("finish"),
                    cancelButtonText: t("cancel")
                }}
            >
                <SettingsCache form={form} showSectionHeading showSectionDescription />
            </WizardStep>
        </Wizard>
    );
};
