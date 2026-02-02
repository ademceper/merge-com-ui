/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/organizations/InviteMemberModal.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { FormSubmitButton, TextControl } from "../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@merge/ui/components/dialog";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { useAlerts } from "../../shared/keycloak-ui-shared";

type InviteMemberModalProps = {
    orgId: string;
    onClose: () => void;
};

export const InviteMemberModal = ({ orgId, onClose }: InviteMemberModalProps) => {
    const { adminClient } = useAdminClient();
    const { addAlert, addError } = useAlerts();

    const { t } = useTranslation();
    const form = useForm<Record<string, string>>();
    const { handleSubmit, formState } = form;

    const submitForm = async (data: Record<string, string>) => {
        try {
            const formData = new FormData();
            for (const key in data) {
                formData.append(key, data[key]);
            }
            await adminClient.organizations.invite({ orgId }, formData);
            addAlert(t("inviteSent"));
            onClose();
        } catch (error) {
            addError("inviteSentError", error);
        }
    };

    return (
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
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
                    <FormSubmitButton
                        formState={formState}
                        data-testid="save"
                        form="form"
                        allowInvalid
                        allowNonDirty
                    >
                        {t("send")}
                    </FormSubmitButton>
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
