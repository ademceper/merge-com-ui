import { getErrorDescription, getErrorMessage } from "../../../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import { Button } from "@merge-rd/ui/components/button";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAdminClient } from "../../../app/admin-client";
import { FormAccess } from "../../../shared/ui/form/form-access";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { convertFormValuesToObject } from "../../../shared/lib/util";
import { FormFields } from "../client-details";
import { toClient } from "../routes/client";
import { toClients } from "../routes/clients";
import { CapabilityConfig } from "./capability-config";
import { GeneralSettings } from "./general-settings";
import { LoginSettings } from "./login-settings";
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
            toast.success(t("createClientSuccess"));
            navigate(toClient({ realm, clientId: newClient.id, tab: "settings" }));
        } catch (error) {
            toast.error(t("createClientError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
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
