/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/authentication/EditFlowModal.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type AuthenticationFlowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticationFlowRepresentation";
import { useAlerts } from "../../shared/keycloak-ui-shared";
import {
    AlertVariant,
    Button,
    ButtonVariant,
    Form,
    Modal,
    ModalVariant
} from "../../shared/@patternfly/react-core";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useAdminClient } from "../admin-client";
import { NameDescription } from "./form/NameDescription";

type EditFlowModalProps = {
    flow: AuthenticationFlowRepresentation;
    toggleDialog: () => void;
};

export const EditFlowModal = ({ flow, toggleDialog }: EditFlowModalProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { addAlert, addError } = useAlerts();
    const form = useForm<AuthenticationFlowRepresentation>({ mode: "onChange" });
    const { reset, handleSubmit } = form;

    useEffect(() => reset(flow), [flow]);

    const onSubmit = async (formValues: AuthenticationFlowRepresentation) => {
        try {
            await adminClient.authenticationManagement.updateFlow(
                { flowId: flow.id! },
                { ...flow, ...formValues }
            );
            addAlert(t("updateFlowSuccess"), AlertVariant.success);
        } catch (error) {
            addError("updateFlowError", error);
        }
        toggleDialog();
    };

    return (
        <Modal
            title={t("editFlow")}
            onClose={toggleDialog}
            variant={ModalVariant.small}
            actions={[
                <Button
                    key="confirm"
                    data-testid="confirm"
                    type="submit"
                    form="edit-flow-form"
                >
                    {t("edit")}
                </Button>,
                <Button
                    key="cancel"
                    data-testid="cancel"
                    variant={ButtonVariant.link}
                    onClick={() => toggleDialog()}
                >
                    {t("cancel")}
                </Button>
            ]}
            isOpen
        >
            <FormProvider {...form}>
                <Form id="edit-flow-form" onSubmit={handleSubmit(onSubmit)} isHorizontal>
                    <NameDescription />
                </Form>
            </FormProvider>
        </Modal>
    );
};
