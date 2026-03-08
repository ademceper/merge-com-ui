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
import { SelectField, TextControl } from "../../../../../shared/keycloak-ui-shared";
import { useFormProviders } from "../../hooks/use-form-providers";

type AddSubFlowProps = {
    name: string;
    onConfirm: (flow: Flow) => void;
    onCancel: () => void;
};

const types = ["basic-flow", "form-flow"] as const;

export type Flow = {
    name: string;
    description: string;
    type: (typeof types)[number];
    provider: string;
};

export const AddSubFlowModal = ({ name, onConfirm, onCancel }: AddSubFlowProps) => {
    const { t } = useTranslation();
    const form = useForm<Flow>();
    const { data: formProviders } = useFormProviders();

    useEffect(() => {
        if (formProviders?.length === 1) {
            form.setValue("provider", formProviders[0].id!);
        }
    }, [formProviders]);

    return (
        <Dialog
            open
            onOpenChange={open => {
                if (!open) onCancel();
            }}
        >
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t("addSubFlowTo", { name })}</DialogTitle>
                </DialogHeader>
                <form id="sub-flow-form" onSubmit={form.handleSubmit(onConfirm)}>
                    <FormProvider {...form}>
                        <TextControl
                            name="name"
                            label={t("name")}
                            labelIcon={t("clientIdHelp")}
                            rules={{ required: t("required") }}
                        />
                        <TextControl
                            name="description"
                            label={t("description")}
                            labelIcon={t("flowNameDescriptionHelp")}
                        />
                        <SelectField
                            name="type"
                            label={t("flowType")}
                            options={types.map(type => ({
                                key: type,
                                value: t(`flow-type.${type}`)
                            }))}
                            defaultValue={types[0]}
                        />
                        {formProviders && formProviders.length > 1 && (
                            <SelectField
                                name="provider"
                                label={t("provider")}
                                labelIcon={t("authenticationFlowTypeHelp")}
                                options={formProviders.map(provider => ({
                                    key: provider.id!,
                                    value: provider.displayName!
                                }))}
                                defaultValue=""
                            />
                        )}
                    </FormProvider>
                </form>
                <DialogFooter>
                    <Button
                        key="add"
                        data-testid="modal-add"
                        type="submit"
                        form="sub-flow-form"
                    >
                        {t("add")}
                    </Button>
                    <Button
                        key="cancel"
                        data-testid="cancel"
                        variant="link"
                        onClick={onCancel}
                    >
                        {t("cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
