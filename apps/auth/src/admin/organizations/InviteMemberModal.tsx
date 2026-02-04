import { FormSubmitButton, TextControl } from "../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@merge/ui/components/dialog";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { getErrorDescription, getErrorMessage } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";

type InviteMemberModalProps = {
    orgId: string;
    onClose: () => void;
};

export const InviteMemberModal = ({ orgId, onClose }: InviteMemberModalProps) => {
    const { adminClient } = useAdminClient();
const { t } = useTranslation();
    const form = useForm<Record<string, string>>();
    const { handleSubmit, formState } = form;

    const submitForm = async (data: Record<string, string>) => {
        try {
            const formData = new FormData();
            for (const key in data) {
                formData.append(key, data[key]);
            }
            await adminClient.organizations.invite({ orgId }, formData);
            toast.success(t("inviteSent"));
            onClose();
        } catch (error) {
            toast.error(t("inviteSentError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("inviteMember")}</DialogTitle>
                </DialogHeader>
                <FormProvider {...form}>
                    <form id="form" onSubmit={handleSubmit(submitForm)}>
                        <TextControl
                            name="email"
                            label={t("email")}
                            rules={{ required: t("required") }}
                            autoFocus
                        />
                        <TextControl name="firstName" label={t("firstName")} />
                        <TextControl name="lastName" label={t("lastName")} />
                    </form>
                </FormProvider>
                <DialogFooter>
                    <FormSubmitButton
                        formState={formState}
                        data-testid="save"
                        form="form"
                        allowInvalid
                        allowNonDirty
                    >
                        {t("send")}
                    </FormSubmitButton>
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
