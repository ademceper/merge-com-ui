import IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { SelectControl } from "../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@merge/ui/components/dialog";
import { useEffect } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { DefaultSwitchControl } from "../components/SwitchControl";
import { getErrorDescription, getErrorMessage } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import {
    convertAttributeNameToForm,
    convertFormValuesToObject,
    convertToFormValues
} from "../util";
import { IdentityProviderSelect } from "./IdentityProviderSelect";
import { OrganizationFormType } from "./OrganizationForm";

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
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
const form = useForm<LinkRepresentation>({ mode: "onChange" });
    const { handleSubmit, formState, setValue } = form;
    const { getValues } = useFormContext<OrganizationFormType>();

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
            const foundIdentityProvider = await adminClient.identityProviders.findOne({
                alias: data.alias[0]
            });
            if (!foundIdentityProvider) {
                throw new Error(t("notFound"));
            }
            const { config } = convertFormValuesToObject(data);
            foundIdentityProvider.config = {
                ...foundIdentityProvider.config,
                ...config
            };
            foundIdentityProvider.hideOnLogin = data.hideOnLogin ?? true;
            await adminClient.identityProviders.update(
                { alias: data.alias[0] },
                foundIdentityProvider
            );

            if (!identityProvider) {
                await adminClient.organizations.linkIdp({
                    orgId,
                    alias: data.alias[0]
                });
            }
            toast.success(t(!identityProvider ? "linkSuccessful" : "linkUpdatedSuccessful"));
            onClose();
        } catch (error) {
            toast.error(t(!identityProvider ? "linkError" : "linkUpdatedError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
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
                        <SelectControl
                            name={convertAttributeNameToForm("config.kc.org.domain")}
                            label={t("domain")}
                            controller={{ defaultValue: "" }}
                            options={[
                                { key: "", value: t("none") },
                                { key: "ANY", value: t("any") },
                                ...(getValues("domains")
                                    ? getValues("domains")!.map(d => ({ key: d, value: d }))
                                    : [])
                            ]}
                            menuAppendTo="parent"
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
                        disabled={formState.isLoading || formState.isValidating || formState.isSubmitting}
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
