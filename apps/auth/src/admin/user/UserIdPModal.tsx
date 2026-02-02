/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/user/UserIdPModal.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type FederatedIdentityRepresentation from "@keycloak/keycloak-admin-client/lib/defs/federatedIdentityRepresentation";
import { AlertVariant } from "../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@merge/ui/components/dialog";
import { Input } from "@merge/ui/components/input";
import { Label } from "@merge/ui/components/label";
import { capitalize } from "lodash-es";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TextControl } from "../../shared/keycloak-ui-shared";
import { useAdminClient } from "../admin-client";
import { useAlerts } from "../../shared/keycloak-ui-shared";

type UserIdpModalProps = {
    userId: string;
    federatedId: string;
    onClose: () => void;
    onRefresh: () => void;
};

export const UserIdpModal = ({
    userId,
    federatedId,
    onClose,
    onRefresh
}: UserIdpModalProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { addAlert, addError } = useAlerts();
    const form = useForm<FederatedIdentityRepresentation>({
        mode: "onChange"
    });
    const {
        handleSubmit,
        formState: { isValid }
    } = form;

    const onSubmit = async (federatedIdentity: FederatedIdentityRepresentation) => {
        try {
            await adminClient.users.addToFederatedIdentity({
                id: userId,
                federatedIdentityId: federatedId,
                federatedIdentity
            });
            addAlert(t("idpLinkSuccess"), AlertVariant.success);
            onClose();
            onRefresh();
        } catch (error) {
            addError("couldNotLinkIdP", error);
        }
    };

    return (
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {t("linkAccountTitle", {
                            provider: capitalize(federatedId)
                        })}
                    </DialogTitle>
                </DialogHeader>
                <form id="group-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FormProvider {...form}>
                        <div className="space-y-2">
                            <Label htmlFor="identityProvider">{t("identityProvider")}</Label>
                            <Input
                                id="identityProvider"
                                data-testid="idpNameInput"
                                value={capitalize(federatedId)}
                                readOnly
                            />
                        </div>
                        <TextControl
                            name="userId"
                            label={t("userID")}
                            helperText={t("userIdHelperText")}
                            autoFocus
                            rules={{
                                required: t("required")
                            }}
                        />
                        <TextControl
                            name="userName"
                            label={t("username")}
                            helperText={t("usernameHelperText")}
                            rules={{
                                required: t("required")
                            }}
                        />
                    </FormProvider>
                </form>
                <DialogFooter>
                    <Button
                        key="confirm"
                        data-testid="confirm"
                        type="submit"
                        form="group-form"
                        disabled={!isValid}
                    >
                        {t("link")}
                    </Button>
                    <Button
                        key="cancel"
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
