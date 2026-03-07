import { TextControl } from "../../../../shared/keycloak-ui-shared";
import { ConfirmDialogModal } from "../../../shared/ui/confirm-dialog/confirm-dialog";
import { useTranslation } from "@merge-rd/i18n";
import { FormProvider, useForm } from "react-hook-form";

type FileNameDialogProps = {
    onSave: (fileName: string) => void;
    onClose: () => void;
};

type FormValues = {
    fileName: string;
};
export const FileNameDialog = ({ onSave, onClose }: FileNameDialogProps) => {
    const { t } = useTranslation();
    const form = useForm<FormValues>();
    const { handleSubmit } = form;

    const save = ({ fileName }: FormValues) => onSave(fileName);
    return (
        <ConfirmDialogModal
            titleKey="fileNameDialogTitle"
            open
            toggleDialog={onClose}
            onConfirm={() => handleSubmit(save)()}
        >
            <form className="flex flex-col gap-4" onSubmit={handleSubmit(save)}>
                <FormProvider {...form}>
                    <TextControl
                        name="fileName"
                        label={t("fileName")}
                        defaultValue="quick-theme.jar"
                    />
                </FormProvider>
            </form>
        </ConfirmDialogModal>
    );
};
