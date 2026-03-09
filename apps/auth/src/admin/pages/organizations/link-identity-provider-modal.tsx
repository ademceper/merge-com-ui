import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge-rd/ui/components/dialog";
import { useEffect } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    SelectField
} from "@/shared/keycloak-ui-shared";
import {
    convertAttributeNameToForm,
    convertFormValuesToObject,
    convertToFormValues
} from "@/admin/shared/lib/util";
import { DefaultSwitchControl } from "@/admin/shared/ui/switch-control";
import { useLinkIdentityProvider } from "./hooks/use-link-identity-provider";
import { IdentityProviderSelect } from "./identity-provider-select";
import type { OrganizationFormType } from "./organization-form";

type LinkIdentityProviderModalProps = {
    orgId: string;
    identityProvider?: IdentityProviderRepresentation;
    onClose: () => void;
};

type LinkRepresentation = {
    alias: string[] | string;
    hideOnLogin: boolean;
    config: {
        "kc.org.domain": string;
    };
};

export const LinkIdentityProviderModal = ({
    orgId,
    identityProvider,
    onClose
}: LinkIdentityProviderModalProps) => {
    const { t } = useTranslation();
    const form = useForm<LinkRepresentation>({ mode: "onChange" });
    const { handleSubmit, formState, setValue } = form;
    const { getValues } = useFormContext<OrganizationFormType>();
    const { mutateAsync: linkIdp } = useLinkIdentityProvider(orgId);

    useEffect(
        () =>
            convertToFormValues(
                {
                    ...identityProvider,
                    alias: [identityProvider?.alias],
                    hideOnLogin: identityProvider?.hideOnLogin
                },
                setValue
            ),
        []
    );

    const submitForm = async (data: LinkRepresentation) => {
        try {
            const { config } = convertFormValuesToObject(data);
            await linkIdp({
                alias: data.alias[0] as string,
                config,
                hideOnLogin: data.hideOnLogin ?? true,
                isNew: !identityProvider
            });
            toast.success(
                t(!identityProvider ? "linkSuccessful" : "linkUpdatedSuccessful")
            );
            onClose();
        } catch (error) {
            toast.error(
                t(!identityProvider ? "linkError" : "linkUpdatedError", {
                    error: getErrorMessage(error)
                }),
                { description: getErrorDescription(error) }
            );
        }
    };

    return (
        <Dialog
            open
            onOpenChange={open => {
                if (!open) onClose();
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("linkIdentityProvider")}</DialogTitle>
                </DialogHeader>
                <FormProvider {...form}>
                    <form id="form" onSubmit={handleSubmit(submitForm)}>
                        <IdentityProviderSelect
                            name="alias"
                            label={t("identityProvider")}
                            defaultValue={[]}
                            isRequired
                            isDisabled={!!identityProvider}
                        />
                        <SelectField
                            name={convertAttributeNameToForm("config.kc.org.domain")}
                            label={t("domain")}
                            defaultValue=""
                            options={[
                                { key: "", value: t("none") },
                                { key: "ANY", value: t("any") },
                                ...(getValues("domains")
                                    ? getValues("domains")!.map(d => ({
                                          key: d,
                                          value: d
                                      }))
                                    : [])
                            ]}
                        />
                        <DefaultSwitchControl
                            name="hideOnLogin"
                            label={t("hideOnLoginPage")}
                            labelIcon={t("hideOnLoginPageHelp")}
                            defaultValue={true}
                        />
                        <DefaultSwitchControl
                            name={convertAttributeNameToForm(
                                "config.kc.org.broker.redirect.mode.email-matches"
                            )}
                            label={t("redirectWhenEmailMatches")}
                            labelIcon={t("redirectWhenEmailMatchesHelp")}
                            stringify
                        />
                    </form>
                </FormProvider>
                <DialogFooter>
                    <Button
                        type="submit"
                        form="form"
                        data-testid="confirm"
                        disabled={
                            formState.isLoading ||
                            formState.isValidating ||
                            formState.isSubmitting
                        }
                    >
                        {t("save")}
                    </Button>
                    <Button
                        id="modal-cancel"
                        data-testid="cancel"
                        variant="link"
                        onClick={onClose}
                    >
                        {t("cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
