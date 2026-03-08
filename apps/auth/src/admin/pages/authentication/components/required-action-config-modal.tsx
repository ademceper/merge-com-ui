import type RequiredActionConfigRepresentation from "@keycloak/keycloak-admin-client/lib/defs/requiredActionConfigRepresentation";
import type RequiredActionProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@merge-rd/ui/components/dialog";
import { Trash } from "@phosphor-icons/react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    isUserProfileError,
    setUserProfileServerError
} from "../../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../../app/admin-client";
import { convertFormValuesToObject, convertToFormValues } from "../../../shared/lib/util";
import { DynamicComponents } from "../../../shared/ui/dynamic/dynamic-components";
import { useRequiredActionConfigData } from "../api/use-required-action-config-data";

type RequiredActionConfigModalForm = {
    // alias: string;
    config: { [index: string]: string };
};

type RequiredActionConfigModalProps = {
    requiredAction: RequiredActionProviderRepresentation;
    onClose: () => void;
};

export const RequiredActionConfigModal = ({
    requiredAction,
    onClose
}: RequiredActionConfigModalProps) => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();

    const form = useForm<RequiredActionConfigModalForm>();
    const { setValue, handleSubmit } = form;

    const { data: configData } = useRequiredActionConfigData(requiredAction.alias!);
    const configDescription = configData?.configDescription;

    const setupForm = (config?: RequiredActionConfigRepresentation) => {
        convertToFormValues(config || {}, setValue);
    };

    useEffect(() => {
        if (configData?.config) {
            setupForm(configData.config);
        }
    }, [configData]);

    const save = async (saved: RequiredActionConfigModalForm) => {
        const newConfig = convertFormValuesToObject(saved);
        try {
            await adminClient.authenticationManagement.updateRequiredActionConfig(
                { alias: requiredAction.alias! },
                newConfig
            );
            setupForm(newConfig);
            toast.success(t("configSaveSuccess"));
            onClose();
        } catch (error) {
            if (isUserProfileError(error)) {
                setUserProfileServerError(
                    error,
                    (_name: string | number, error: unknown) => {
                        // TODO: Does not set set the error message to the field, yet.
                        // Still, this will do all front end replacement and translation of keys.
                        toast.error(
                            t("configSaveError", { error: (error as any).message }),
                            { description: getErrorDescription(error) }
                        );
                    },
                    t
                );
            } else {
                toast.error(t("configSaveError", { error: getErrorMessage(error) }), {
                    description: getErrorDescription(error)
                });
            }
        }
    };

    return (
        <Dialog
            open
            onOpenChange={open => {
                if (!open) onClose();
            }}
        >
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {t("requiredActionConfig", { name: requiredAction.name })}
                    </DialogTitle>
                </DialogHeader>
                <form id="required-action-config-form" onSubmit={handleSubmit(save)}>
                    <FormProvider {...form}>
                        <DynamicComponents
                            stringify
                            properties={configDescription?.properties || []}
                        />
                    </FormProvider>
                    <div className="flex gap-2 mt-4">
                        <Button data-testid="save" type="submit">
                            {t("save")}
                        </Button>
                        <Button data-testid="cancel" variant="link" onClick={onClose}>
                            {t("cancel")}
                        </Button>
                        <Button
                            className="ml-auto"
                            data-testid="clear"
                            variant="link"
                            onClick={async () => {
                                await adminClient.authenticationManagement.removeRequiredActionConfig(
                                    {
                                        alias: requiredAction.alias!
                                    }
                                );
                                form.reset({});
                                onClose();
                            }}
                        >
                            {t("clear")} <Trash className="size-4" />
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
