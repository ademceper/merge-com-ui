import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge-rd/ui/components/dialog";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    TextControl
} from "../../../shared/keycloak-ui-shared";
import { useInviteMember } from "./hooks/use-invite-member";

type InviteMemberModalProps = {
    orgId: string;
    onClose: () => void;
};

export const InviteMemberModal = ({ orgId, onClose }: InviteMemberModalProps) => {
    const { t } = useTranslation();
    const form = useForm<Record<string, string>>();
    const { handleSubmit, formState } = form;
    const { mutateAsync: inviteMember } = useInviteMember(orgId);

    const submitForm = async (data: Record<string, string>) => {
        try {
            const formData = new FormData();
            for (const key in data) {
                formData.append(key, data[key]);
            }
            await inviteMember(formData);
            toast.success(t("inviteSent"));
            onClose();
        } catch (error) {
            toast.error(t("inviteSentError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
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
                    <Button
                        type="submit"
                        form="form"
                        data-testid="save"
                        disabled={
                            formState.isLoading ||
                            formState.isValidating ||
                            formState.isSubmitting
                        }
                    >
                        {t("send")}
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
