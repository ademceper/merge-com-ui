/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/themes/FileNameDialog.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { TextControl } from "../../../shared/keycloak-ui-shared";
import { ConfirmDialogModal } from "../../components/confirm-dialog/ConfirmDialog";
import { useTranslation } from "react-i18next";
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
