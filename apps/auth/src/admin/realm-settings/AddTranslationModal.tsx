import { Button } from "@merge/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge/ui/components/dialog";
import { FormProvider, SubmitHandler, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TextControl } from "../../shared/keycloak-ui-shared";
import type { KeyValueType } from "../components/key-value-form/key-value-convert";

type AddTranslationModalProps = {
    id?: string;
    form: UseFormReturn<TranslationForm>;
    save: SubmitHandler<TranslationForm>;
    handleModalToggle: () => void;
};

export type TranslationForm = {
    key: string;
    value: string;
    translation: KeyValueType;
};

export const AddTranslationModal = ({
    handleModalToggle,
    save,
    form
}: AddTranslationModalProps) => {
    const { t } = useTranslation();

    return (
        <Dialog open onOpenChange={(open) => { if (!open) handleModalToggle(); }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("addTranslation")}</DialogTitle>
                </DialogHeader>
                <form id="translation-form" onSubmit={form.handleSubmit(save)}>
                    <FormProvider {...form}>
                        <TextControl
                            name="key"
                            label={t("key")}
                            autoFocus
                            rules={{
                                required: t("required")
                            }}
                        />
                        <TextControl
                            name="value"
                            label={t("value")}
                            rules={{
                                required: t("required")
                            }}
                        />
                    </FormProvider>
                </form>
                <DialogFooter>
                    <Button
                        data-testid="add-translation-confirm-button"
                        type="submit"
                        form="translation-form"
                    >
                        {t("create")}
                    </Button>
                    <Button
                        id="modal-cancel"
                        data-testid="cancel"
                        variant="ghost"
                        onClick={() => {
                            handleModalToggle();
                        }}
                    >
                        {t("cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
