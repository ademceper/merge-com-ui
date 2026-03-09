import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import type ComponentTypeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentTypeRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge-rd/ui/components/dialog";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useServerInfo } from "@/admin/app/providers/server-info/server-info-provider";
import { DynamicComponents } from "@/admin/shared/ui/dynamic/dynamic-components";
import type { IndexedValidations } from "@/admin/pages/realm-settings/new-attribute-settings";
import { ValidatorSelect } from "./validator-select";

type AddValidatorDialogProps = {
    selectedValidators: IndexedValidations[];
    toggleDialog: () => void;
    onConfirm: (newValidator: ComponentRepresentation) => void;
};

export const AddValidatorDialog = ({
    selectedValidators,
    toggleDialog,
    onConfirm
}: AddValidatorDialogProps) => {
    const { t } = useTranslation();
    const [selectedValidator, setSelectedValidator] =
        useState<ComponentTypeRepresentation>();

    const allSelected =
        useServerInfo().componentTypes?.["org.keycloak.validate.Validator"].length ===
        selectedValidators.length;
    const form = useForm<ComponentTypeRepresentation>();
    const { handleSubmit } = form;

    const save = (newValidator: ComponentTypeRepresentation) => {
        onConfirm({ ...newValidator, id: selectedValidator?.id });
        toggleDialog();
    };

    return (
        <Dialog open onOpenChange={open => !open && toggleDialog()}>
            <DialogContent aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>{t("addValidator")}</DialogTitle>
                </DialogHeader>
                {allSelected ? (
                    t("emptyValidators")
                ) : (
                    <form id="add-validator" onSubmit={handleSubmit(save)}>
                        <ValidatorSelect
                            selectedValidators={selectedValidators.map(
                                validator => validator.key
                            )}
                            onChange={setSelectedValidator}
                        />
                        {selectedValidator && (
                            <FormProvider {...form}>
                                <DynamicComponents
                                    properties={selectedValidator.properties}
                                />
                            </FormProvider>
                        )}
                    </form>
                )}
                <DialogFooter>
                    <Button
                        data-testid="save-validator-role-button"
                        type="submit"
                        form="add-validator"
                    >
                        {t("save")}
                    </Button>
                    <Button
                        data-testid="cancel-validator-role-button"
                        variant="ghost"
                        onClick={toggleDialog}
                    >
                        {t("cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
