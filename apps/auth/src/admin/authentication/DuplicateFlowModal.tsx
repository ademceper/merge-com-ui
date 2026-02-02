/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/authentication/DuplicateFlowModal.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import AuthenticationFlowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticationFlowRepresentation";
import { AlertVariant, useAlerts } from "../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@merge/ui/components/dialog";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { useRealm } from "../context/realm-context/RealmContext";
import { NameDescription } from "./form/NameDescription";
import { toFlow } from "./routes/Flow";

type DuplicateFlowModalProps = {
    name: string;
    description: string;
    toggleDialog: () => void;
    onComplete: () => void;
};

export const DuplicateFlowModal = ({
    name,
    description,
    toggleDialog,
    onComplete
}: DuplicateFlowModalProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const form = useForm<AuthenticationFlowRepresentation>({
        mode: "onChange",
        defaultValues: {
            alias: t("copyOf", { name }),
            description: description
        }
    });
    const { getValues, handleSubmit } = form;
    const { addAlert, addError } = useAlerts();
    const navigate = useNavigate();
    const { realm } = useRealm();

    const onSubmit = async () => {
        const form = getValues();
        try {
            await adminClient.authenticationManagement.copyFlow({
                flow: name,
                newName: form.alias!
            });
            const newFlow = (await adminClient.authenticationManagement.getFlows()).find(
                flow => flow.alias === form.alias
            )!;

            if (form.description !== description) {
                newFlow.description = form.description;
                await adminClient.authenticationManagement.updateFlow(
                    { flowId: newFlow.id! },
                    newFlow
                );
            }
            addAlert(t("copyFlowSuccess"), AlertVariant.success);
            navigate(
                toFlow({
                    realm,
                    id: newFlow.id!,
                    usedBy: "notInUse",
                    builtIn: newFlow.builtIn ? "builtIn" : undefined
                })
            );
        } catch (error) {
            addError("copyFlowError", error);
        }
        onComplete();
    };

    return (
        <Dialog open onOpenChange={(open) => { if (!open) toggleDialog(); }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("duplicateFlow")}</DialogTitle>
                </DialogHeader>
                <FormProvider {...form}>
                    <form
                        id="duplicate-flow-form"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <NameDescription />
                    </form>
                </FormProvider>
                <DialogFooter>
                    <Button
                        key="confirm"
                        data-testid="confirm"
                        type="submit"
                        form="duplicate-flow-form"
                    >
                        {t("duplicate")}
                    </Button>
                    <Button
                        key="cancel"
                        data-testid="cancel"
                        variant="link"
                        onClick={toggleDialog}
                    >
                        {t("cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
