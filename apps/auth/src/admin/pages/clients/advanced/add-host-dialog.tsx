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
} from "@/shared/keycloak-ui-shared";
import { useAddClusterNode } from "../hooks/use-cluster-nodes";

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

    const { t } = useTranslation();
    const { mutateAsync: addClusterNode } = useAddClusterNode();
    const form = useForm<FormFields>();
    const {
        handleSubmit,
        formState: { isDirty, isValid }
    } = form;
    async function onSubmit({ node }: FormFields) {
        try {
            await addClusterNode({ clientId: id, node });
            onAdded(node);
            toast.success(t("addedNodeSuccess"));
        } catch (error) {
            toast.error(t("addedNodeFail", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }

        onClose();
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={open => {
                if (!open) onClose();
            }}
        >
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("addNode")}</DialogTitle>
                </DialogHeader>
                <FormProvider {...form}>
                    <form
                        id="add-host-form"
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
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
                    <Button id="add-node-cancel" variant="link" onClick={onClose}>
                        {t("cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
