/**
 * Client oluşturma wizard'ı Dialog içinde. Step göstergeleri ve merge UI Dialog kullanır.
 */

/* eslint-disable */
// @ts-nocheck

import { AlertVariant, useAlerts } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@merge/ui/components/dialog";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import { cn } from "@merge/ui/lib/utils";
import { useAdminClient } from "../../admin-client";
import { FormAccess } from "../../components/form/FormAccess";
import { useRealm } from "../../context/realm-context/RealmContext";
import { convertFormValuesToObject } from "../../util";
import { FormFields } from "../ClientDetails";
import { toClient } from "../routes/Client";
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

type AddClientDialogProps = {
    trigger: React.ReactNode;
    onSuccess?: (clientId: string) => void;
};

export function AddClientDialog({ trigger, onSuccess }: AddClientDialogProps) {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const { realm } = useRealm();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
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
                saml_idp_initiated_sso_url_name: "",
            },
        },
    });
    const { getValues, watch, trigger: formTrigger } = form;
    const protocol = watch("protocol");

    const steps: WizardStep[] = [
        {
            name: t("generalSettings"),
            id: "generalSettings",
            component: <GeneralSettings />,
        },
        {
            name: t("capabilityConfig"),
            id: "capabilityConfig",
            isHidden: protocol === "saml",
            component: <CapabilityConfig protocol={protocol} />,
        },
        {
            name: t("loginSettings"),
            id: "loginSettings",
            component: (
                <FormAccess isHorizontal role="manage-clients">
                    <LoginSettings protocol={protocol} />
                </FormAccess>
            ),
        },
    ].filter((step) => !step.isHidden);

    const totalSteps = steps.length;
    const effectiveStep = Math.min(currentStep, totalSteps - 1);
    const isLastStep = effectiveStep === totalSteps - 1;

    useEffect(() => {
        if (currentStep >= totalSteps && totalSteps > 0) {
            setCurrentStep(totalSteps - 1);
        }
    }, [currentStep, totalSteps]);

    const save = async () => {
        if (saving) return;
        setSaving(true);
        const client = convertFormValuesToObject(getValues());
        try {
            const newClient = await adminClient.clients.create({
                ...client,
                clientId: client.clientId?.trim(),
            });
            addAlert(t("createClientSuccess"), AlertVariant.success);
            setOpen(false);
            onSuccess?.(newClient.id!);
            navigate(toClient({ realm, clientId: newClient.id!, tab: "settings" }));
        } catch (error) {
            addError("createClientError", error);
        } finally {
            setSaving(false);
        }
    };

    const handleOpenChange = (next: boolean) => {
        setOpen(next);
        if (!next) {
            setCurrentStep(0);
            form.reset();
        }
    };

    const handleContinue = async () => {
        if (!(await formTrigger())) return;
        if (isLastStep) {
            save();
        } else {
            setCurrentStep((s) => s + 1);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-lg sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{steps[effectiveStep]?.name ?? t("createClient")}</DialogTitle>
                </DialogHeader>
                <FormProvider {...form}>
                    <div className="min-h-[200px]">{steps[effectiveStep]?.component}</div>
                </FormProvider>
                <DialogFooter className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex w-full items-center justify-center gap-1.5 text-muted-foreground sm:w-auto sm:justify-start">
                        <span className="text-xs">
                            {effectiveStep + 1} / {totalSteps}
                        </span>
                        <span className="text-xs">·</span>
                        <span className="text-xs">{steps[effectiveStep]?.name}</span>
                        <div className="ml-1 flex gap-1.5">
                            {[...Array(totalSteps)].map((_, index) => (
                                <div
                                    key={String(index)}
                                    className={cn(
                                        "size-1.5 rounded-full bg-primary",
                                        index === effectiveStep ? "opacity-100" : "opacity-20",
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="ghost">
                                {t("cancel")}
                            </Button>
                        </DialogClose>
                        {effectiveStep > 0 && (
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setCurrentStep((s) => s - 1)}
                            >
                                {t("back")}
                            </Button>
                        )}
                        <Button
                            type="button"
                            onClick={handleContinue}
                            disabled={saving}
                            className="group"
                        >
                            {isLastStep ? t("save") : t("next")}
                            {!isLastStep && (
                                <ArrowRight
                                    aria-hidden
                                    className="-me-1 size-4 opacity-60 transition-transform group-hover:translate-x-0.5"
                                />
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
