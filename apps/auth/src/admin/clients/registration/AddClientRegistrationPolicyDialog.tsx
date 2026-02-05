import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import type ComponentTypeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentTypeRepresentation";
import { getErrorDescription, getErrorMessage, TextControl } from "../../../shared/keycloak-ui-shared";
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
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "@phosphor-icons/react";
import { cn } from "@merge/ui/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAdminClient } from "../../admin-client";
import { DynamicComponents } from "../../components/dynamic/DynamicComponents";
import { FormAccess } from "../../components/form/FormAccess";
import { useRealm } from "../../context/realm-context/RealmContext";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";
import useLocaleSort, { mapByKey } from "../../utils/useLocaleSort";

const POLICY_TYPE = "org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy";

type AddClientRegistrationPolicyDialogProps = {
    trigger: React.ReactNode;
    subTab: "anonymous" | "authenticated";
    onSuccess?: () => void;
};

export function AddClientRegistrationPolicyDialog({
    trigger,
    subTab,
    onSuccess,
}: AddClientRegistrationPolicyDialogProps) {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const { realm, realmRepresentation } = useRealm();
    const serverInfo = useServerInfo();
    const [open, setOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedProvider, setSelectedProvider] = useState<ComponentTypeRepresentation | null>(null);
    const [saving, setSaving] = useState(false);
    const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        };
    }, []);

    const providers = Object.keys(
        serverInfo.providers?.["client-registration-policy"]?.providers || []
    );
    const descriptions = serverInfo.componentTypes?.[POLICY_TYPE];
    const localeSort = useLocaleSort();
    const providerRows = useMemo(
        () =>
            localeSort(
                descriptions?.filter((d) => providers.includes(d.id!)) || [],
                mapByKey("id")
            ),
        [providers, descriptions, localeSort]
    );

    const form = useForm<ComponentRepresentation>({
        defaultValues: { providerId: "", name: "" },
    });
    const { handleSubmit, reset } = form;

    const totalSteps = 2;
    const isLastStep = currentStep === 1;

    const resetToStep0 = () => {
        setCurrentStep(0);
        setSelectedProvider(null);
        reset({ providerId: "", name: "" });
    };

    const handleOpenChange = (next: boolean) => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setOpen(next);
        if (!next) {
            // Reset state after dialog close animation to avoid flicker (content switching to step 0 while closing)
            closeTimeoutRef.current = setTimeout(resetToStep0, 200);
        }
    };

    const onSelectProvider = (provider: ComponentTypeRepresentation) => {
        setSelectedProvider(provider);
        form.reset({ providerId: provider.id!, name: "" });
        setCurrentStep(1);
    };

    const onSubmit = async (component: ComponentRepresentation) => {
        if (!selectedProvider) return;
        if (component.config) {
            Object.entries(component.config).forEach(
                ([key, value]) =>
                    (component.config![key] = Array.isArray(value) ? value : [value])
            );
        }
        setSaving(true);
        try {
            const updatedComponent = {
                ...component,
                subType: subTab,
                parentId: realmRepresentation?.id,
                providerType: POLICY_TYPE,
                providerId: selectedProvider.id,
            };
            await adminClient.components.create(updatedComponent);
            toast.success(t("providerCreateSuccess"));
            setOpen(false);
            handleOpenChange(false);
            onSuccess?.();
        } catch (error) {
            toast.error(
                t("providerCreateError", { error: getErrorMessage(error) }),
                { description: getErrorDescription(error) }
            );
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        setCurrentStep(0);
        setSelectedProvider(null);
        form.reset({ providerId: "", name: "" });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-lg sm:max-w-lg">
                <DialogHeader className="w-full">
                    <div className="flex w-full flex-row items-center justify-between gap-2">
                        <DialogTitle className="min-w-0 flex-1 truncate">
                            {currentStep === 0
                                ? t("chooseAPolicyProvider")
                                : t("createPolicy")}
                        </DialogTitle>
                        <div className="flex shrink-0 items-center gap-1.5 text-muted-foreground md:hidden">
                            <span className="text-xs font-medium tabular-nums whitespace-nowrap">
                                {currentStep + 1} / {totalSteps}
                            </span>
                            <div className="flex shrink-0 gap-1">
                                {[0, 1].map((index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            "size-1.5 rounded-full",
                                            index === currentStep
                                                ? "bg-foreground"
                                                : "bg-muted-foreground/30"
                                        )}
                                        aria-hidden
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                {currentStep === 0 ? (
                    <div className="min-h-[200px]">
                        <div className="space-y-1" aria-label={t("addPredefinedMappers")}>
                            <div className="grid grid-cols-[1fr_2fr] gap-2 p-2 font-bold text-sm">
                                <span>{t("name")}</span>
                                <span>{t("description")}</span>
                            </div>
                            {providerRows.map((provider) => (
                                <div
                                    key={provider.id}
                                    data-testid={provider.id}
                                    className="grid grid-cols-[1fr_2fr] gap-2 p-2 hover:bg-muted cursor-pointer rounded text-sm"
                                    onClick={() => onSelectProvider(provider)}
                                >
                                    <span>{provider.id}</span>
                                    <span>{provider.helpText}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : selectedProvider ? (
                    <FormProvider {...form}>
                        <FormAccess
                            id="create-client-registration-policy-form"
                            role="manage-clients"
                            isHorizontal
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <div className="min-h-[200px] flex flex-col gap-4">
                                <TextControl
                                    name="providerId"
                                    label={t("provider")}
                                    readOnly
                                />
                                <TextControl
                                    name="name"
                                    label={t("name")}
                                    labelIcon={t("clientPolicyNameHelp")}
                                    rules={{ required: t("required") }}
                                />
                                <DynamicComponents
                                    properties={selectedProvider.properties!}
                                    layoutOverridesByType={{
                                        List: { hideLabel: true, helpIconAfterControl: true },
                                        MultivaluedList: { hideLabel: true, helpIconAfterControl: true },
                                        MultivaluedString: { hideLabel: true, helpIconAfterControl: true },
                                        boolean: { booleanLabelTextSwitchHelp: true },
                                    }}
                                />
                            </div>
                        </FormAccess>
                    </FormProvider>
                ) : null}

                <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:flex-nowrap sm:items-center sm:justify-between sm:gap-4">
                    <div className="hidden min-w-0 shrink-0 items-center gap-2 text-muted-foreground md:flex">
                        <span className="text-sm font-medium tabular-nums">
                            {currentStep + 1} / {totalSteps}
                        </span>
                        <span className="text-sm">
                            {currentStep === 0
                                ? t("chooseAPolicyProvider")
                                : t("createPolicy")}
                        </span>
                        <div className="ml-1 flex gap-1.5">
                            {[0, 1].map((index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "size-2 rounded-full transition-colors",
                                        index === currentStep
                                            ? "bg-foreground"
                                            : "bg-muted-foreground/30"
                                    )}
                                    aria-hidden
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:shrink-0 sm:items-center">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-9 min-h-9 w-full text-foreground sm:w-auto"
                            >
                                {t("cancel")}
                            </Button>
                        </DialogClose>
                        {currentStep > 0 && (
                            <Button
                                type="button"
                                variant="secondary"
                                className="h-9 min-h-9 w-full sm:w-auto"
                                onClick={handleBack}
                            >
                                {t("back")}
                            </Button>
                        )}
                        {currentStep === 1 ? (
                            <Button
                                type="submit"
                                form="create-client-registration-policy-form"
                                className="h-9 min-h-9 w-full group sm:w-auto"
                                disabled={saving}
                            >
                                {t("save")}
                            </Button>
                        ) : null}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
