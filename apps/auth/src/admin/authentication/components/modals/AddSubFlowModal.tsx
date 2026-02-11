import type { AuthenticationProviderRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigRepresentation";
import {
    SelectField,
    TextControl,
    useFetch
} from "../../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@merge/ui/components/dialog";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../../admin-client";

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
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const form = useForm<Flow>();
    const [formProviders, setFormProviders] =
        useState<AuthenticationProviderRepresentation[]>();

    useFetch(
        () => adminClient.authenticationManagement.getFormProviders(),
        setFormProviders,
        []
    );

    useEffect(() => {
        if (formProviders?.length === 1) {
            form.setValue("provider", formProviders[0].id!);
        }
    }, [formProviders]);

    return (
        <Dialog open onOpenChange={(open) => { if (!open) onCancel(); }}>
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
                            menuAppendTo="parent"
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
