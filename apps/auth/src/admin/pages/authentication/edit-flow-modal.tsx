import type AuthenticationFlowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticationFlowRepresentation";
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
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { useEditFlow } from "./hooks/use-edit-flow";
import { NameDescription } from "./form/name-description";

type EditFlowModalProps = {
    flow: AuthenticationFlowRepresentation;
    toggleDialog: () => void;
};

export const EditFlowModal = ({ flow, toggleDialog }: EditFlowModalProps) => {

    const { t } = useTranslation();
    const form = useForm<AuthenticationFlowRepresentation>({ mode: "onChange" });
    const { reset, handleSubmit } = form;
    const { mutateAsync: editFlow } = useEditFlow();

    useEffect(() => reset(flow), [flow]);

    const onSubmit = async (formValues: AuthenticationFlowRepresentation) => {
        try {
            await editFlow({ flow, formValues });
            toast.success(t("updateFlowSuccess"));
        } catch (error) {
            toast.error(t("updateFlowError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
        toggleDialog();
    };

    return (
        <Dialog
            open
            onOpenChange={open => {
                if (!open) toggleDialog();
            }}
        >
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("editFlow")}</DialogTitle>
                </DialogHeader>
                <FormProvider {...form}>
                    <form id="edit-flow-form" onSubmit={handleSubmit(onSubmit)}>
                        <NameDescription />
                    </form>
                </FormProvider>
                <DialogFooter>
                    <Button
                        key="confirm"
                        data-testid="confirm"
                        type="submit"
                        form="edit-flow-form"
                    >
                        {t("edit")}
                    </Button>
                    <Button
                        key="cancel"
                        data-testid="cancel"
                        variant="link"
                        onClick={() => toggleDialog()}
                    >
                        {t("cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
