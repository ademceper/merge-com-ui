import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage
} from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { useCreateClient } from "../hooks/use-create-client";
import { toClient, toClients } from "@/admin/shared/lib/routes/clients";
import { convertFormValuesToObject } from "@/admin/shared/lib/util";
import { FormAccess } from "@/admin/shared/ui/form/form-access";
import type { FormFields } from "../client-details";
import { CapabilityConfig } from "./capability-config";
import { GeneralSettings } from "./general-settings";
import { LoginSettings } from "./login-settings";

type WizardStep = {
    name: string;
    id: string;
    isHidden?: boolean;
    component: React.ReactNode;
};

export function NewClientForm() {

    const { t } = useTranslation();
    const { realm } = useRealm();
    const navigate = useNavigate();
    const { mutateAsync: createClient } = useCreateClient();
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
            const newClient = await createClient({
                ...client,
                clientId: client.clientId?.trim()
            });
            toast.success(t("createClientSuccess"));
            navigate({
                to: toClient({ realm, clientId: newClient.id, tab: "settings" }) as string
            });
        } catch (error) {
            toast.error(t("createClientError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
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
                        onClick={() => navigate({ to: toClients({ realm }) as string })}
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
    );
}
