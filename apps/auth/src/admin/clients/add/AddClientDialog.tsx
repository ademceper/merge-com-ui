import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
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
                <FormAccess role="manage-clients">
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
            toast.success(t("createClientSuccess"));
            setOpen(false);
            onSuccess?.(newClient.id!);
            navigate(toClient({ realm, clientId: newClient.id!, tab: "settings" }));
        } catch (error) {
            toast.error(t("createClientError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
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
                <DialogHeader className="w-full">
                    <div className="flex w-full flex-row items-center justify-between gap-2">
                        <DialogTitle className="min-w-0 flex-1 truncate">
                            {steps[effectiveStep]?.name ?? t("createClient")}
                        </DialogTitle>
                        <div className="flex shrink-0 items-center gap-1.5 text-muted-foreground md:hidden">
                            <span className="text-xs font-medium tabular-nums whitespace-nowrap">
                                {effectiveStep + 1} / {totalSteps}
                            </span>
                            <div className="flex shrink-0 gap-1">
                                {[...Array(totalSteps)].map((_, index) => (
                                    <div
                                        key={String(index)}
                                        className={cn(
                                            "size-1.5 rounded-full",
                                            index === effectiveStep
                                                ? "bg-foreground"
                                                : "bg-muted-foreground/30",
                                        )}
                                        aria-hidden
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </DialogHeader>
                <FormProvider {...form}>
                    <div className="min-h-[200px]">{steps[effectiveStep]?.component}</div>
                </FormProvider>
                <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:flex-nowrap sm:items-center sm:justify-between sm:gap-4">
                    <div className="hidden min-w-0 shrink-0 items-center gap-2 text-muted-foreground md:flex">
                        <span className="text-sm font-medium tabular-nums">
                            {effectiveStep + 1} / {totalSteps}
                        </span>
                        <span className="text-sm">{steps[effectiveStep]?.name}</span>
                        <div className="ml-1 flex gap-1.5">
                            {[...Array(totalSteps)].map((_, index) => (
                                <div
                                    key={String(index)}
                                    className={cn(
                                        "size-2 rounded-full transition-colors",
                                        index === effectiveStep
                                            ? "bg-foreground"
                                            : "bg-muted-foreground/30",
                                    )}
                                    aria-hidden
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:shrink-0 sm:items-center">
                        <DialogClose asChild>
                            <Button type="button" variant="ghost" className="h-9 min-h-9 w-full text-foreground sm:w-auto">
                                {t("cancel")}
                            </Button>
                        </DialogClose>
                        {effectiveStep > 0 && (
                            <Button
                                type="button"
                                variant="secondary"
                                className="h-9 min-h-9 w-full sm:w-auto"
                                onClick={() => setCurrentStep((s) => s - 1)}
                            >
                                {t("back")}
                            </Button>
                        )}
                        <Button
                            type="button"
                            className="h-9 min-h-9 w-full group sm:w-auto"
                            onClick={handleContinue}
                            disabled={saving}
                        >
                            {isLastStep ? t("save") : t("next")}
                            {!isLastStep && (
                                <ArrowRight
                                    aria-hidden
                                    className="-me-1 size-4 transition-transform group-hover:translate-x-0.5"
                                />
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
