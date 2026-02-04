import { Button } from "@merge/ui/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@merge/ui/components/dialog";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TextControl } from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../admin-client";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";

type FormFields = {
    node: string;
};

type AddHostDialogProps = {
    clientId: string;
    isOpen: boolean;
    onAdded: (host: string) => void;
    onClose: () => void;
};

export const AddHostDialog = ({
    clientId: id,
    isOpen,
    onAdded,
    onClose
}: AddHostDialogProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const form = useForm<FormFields>();
    const {
        handleSubmit,
        formState: { isDirty, isValid }
    } = form;
async function onSubmit({ node }: FormFields) {
        try {
            await adminClient.clients.addClusterNode({
                id,
                node
            });
            onAdded(node);
            toast.success(t("addedNodeSuccess"));
        } catch (error) {
            toast.error(t("addedNodeFail", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }

        onClose();
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("addNode")}</DialogTitle>
                </DialogHeader>
                <FormProvider {...form}>
                    <form id="add-host-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <TextControl
                            name="node"
                            label={t("nodeHost")}
                            rules={{
                                required: t("required")
                            }}
                        />
                    </form>
                </FormProvider>
                <DialogFooter>
                    <Button
                        id="add-node-confirm"
                        type="submit"
                        form="add-host-form"
                        disabled={!isDirty || !isValid}
                    >
                        {t("save")}
                    </Button>
                    <Button
                        id="add-node-cancel"
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
