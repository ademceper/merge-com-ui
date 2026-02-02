/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/add/NewClientForm.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { AlertVariant, useAlerts } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { FormAccess } from "../../components/form/FormAccess";
import { ViewHeader } from "../../components/view-header/ViewHeader";
import { useRealm } from "../../context/realm-context/RealmContext";
import { convertFormValuesToObject } from "../../util";
import { FormFields } from "../ClientDetails";
import { toClient } from "../routes/Client";
import { toClients } from "../routes/Clients";
import { CapabilityConfig } from "./CapabilityConfig";
import { GeneralSettings } from "./GeneralSettings";
import { LoginSettings } from "./LoginSettings";
import { useState } from "react";

type WizardStep = {
    name: string;
    id: string;
    isHidden?: boolean;
    component: React.ReactNode;
};

export default function NewClientForm() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { realm } = useRealm();
    const navigate = useNavigate();
    const [saving, setSaving] = useState<boolean>(false);
    const [currentStep, setCurrentStep] = useState(0);

    const { addAlert, addError } = useAlerts();
    const form = useForm<FormFields>({
        defaultValues: {
            protocol: "openid-connect",
            clientId: "",
            name: "",
            description: "",
            publicClient: true,
            authorizationServicesEnabled: false,
            serviceAccountsEnabled: false,
            implicitFlowEnabled: false,
            directAccessGrantsEnabled: false,
            standardFlowEnabled: true,
            frontchannelLogout: true,
            attributes: {
                saml_idp_initiated_sso_url_name: ""
            }
        }
    });
    const { getValues, watch, trigger } = form;
    const protocol = watch("protocol");

    const save = async () => {
        if (saving) return;
        setSaving(true);
        const client = convertFormValuesToObject(getValues());
        try {
            const newClient = await adminClient.clients.create({
                ...client,
                clientId: client.clientId?.trim()
            });
            addAlert(t("createClientSuccess"), AlertVariant.success);
            navigate(toClient({ realm, clientId: newClient.id, tab: "settings" }));
        } catch (error) {
            addError("createClientError", error);
        } finally {
            setSaving(false);
        }
    };

    const steps: WizardStep[] = [
        {
            name: t("generalSettings"),
            id: "generalSettings",
            component: <GeneralSettings />
        },
        {
            name: t("capabilityConfig"),
            id: "capabilityConfig",
            isHidden: protocol === "saml",
            component: <CapabilityConfig protocol={protocol} />
        },
        {
            name: t("loginSettings"),
            id: "loginSettings",
            component: (
                <FormAccess isHorizontal role="manage-clients">
                    <LoginSettings protocol={protocol} />
                </FormAccess>
            )
        }
    ].filter(step => !step.isHidden);

    const isLastStep = currentStep === steps.length - 1;

    const forward = async () => {
        if (!(await trigger())) return;
        if (isLastStep) {
            save();
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    return (
        <>
            <ViewHeader titleKey="createClient" subKey="clientsExplain" />
            <div className="p-6">
                <FormProvider {...form}>
                    <nav aria-label={`${t("createClient")} steps`} className="mb-6">
                        <ol className="flex gap-4">
                            {steps.map((step, index) => (
                                <li
                                    key={step.id}
                                    className={`text-sm font-medium ${index === currentStep ? "text-primary" : "text-muted-foreground"}`}
                                >
                                    {index + 1}. {step.name}
                                </li>
                            ))}
                        </ol>
                    </nav>
                    <div>{steps[currentStep]?.component}</div>
                    <div className="flex gap-2 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => navigate(toClients({ realm }))}
                        >
                            {t("cancel")}
                        </Button>
                        {currentStep > 0 && (
                            <Button
                                variant="secondary"
                                onClick={() => setCurrentStep(currentStep - 1)}
                            >
                                {t("back")}
                            </Button>
                        )}
                        <Button onClick={forward}>
                            {isLastStep ? t("save") : t("next")}
                        </Button>
                    </div>
                </FormProvider>
            </div>
        </>
    );
}
