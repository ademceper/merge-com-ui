/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/authentication/form/CreateFlow.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type AuthenticationFlowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticationFlowRepresentation";
import { AlertVariant, FormSubmitButton, SelectControl, useAlerts } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { FormAccess } from "../../components/form/FormAccess";
import { ViewHeader } from "../../components/view-header/ViewHeader";
import { useRealm } from "../../context/realm-context/RealmContext";
import { toAuthentication } from "../routes/Authentication";
import { toFlow } from "../routes/Flow";
import { NameDescription } from "./NameDescription";

const TYPES = ["basic-flow", "client-flow"] as const;

export default function CreateFlow() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { realm } = useRealm();
    const { addAlert } = useAlerts();
    const form = useForm<AuthenticationFlowRepresentation>();
    const { handleSubmit, formState } = form;

    const onSubmit = async (formValues: AuthenticationFlowRepresentation) => {
        const flow = { ...formValues, builtIn: false, topLevel: true };

        try {
            const { id } = await adminClient.authenticationManagement.createFlow(flow);
            addAlert(t("flowCreatedSuccess"), AlertVariant.success);
            navigate(
                toFlow({
                    realm,
                    id: id!,
                    usedBy: "notInUse"
                })
            );
        } catch (error: any) {
            addAlert(
                t("flowCreateError", {
                    error: error.response?.data?.errorMessage || error
                }),
                AlertVariant.danger
            );
        }
    };

    return (
        <>
            <ViewHeader titleKey="createFlow" subKey="authenticationCreateFlowHelp" />
            <div className="p-6">
                <FormProvider {...form}>
                    <FormAccess
                        isHorizontal
                        role="manage-authorization"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <NameDescription />
                        <SelectControl
                            name="providerId"
                            label={t("flowType")}
                            labelIcon={t("topLevelFlowTypeHelp")}
                            aria-label={t("selectFlowType")}
                            controller={{ defaultValue: TYPES[0] }}
                            options={TYPES.map(type => ({
                                key: type,
                                value: t(`top-level-flow-type.${type}`)
                            }))}
                        />
                        <div className="flex gap-2">
                            <FormSubmitButton
                                formState={formState}
                                data-testid="create"
                                allowInvalid
                                allowNonDirty
                            >
                                {t("create")}
                            </FormSubmitButton>
                            <Button
                                data-testid="cancel"
                                variant="link"
                                component={props => (
                                    <Link
                                        {...props}
                                        to={toAuthentication({ realm })}
                                    ></Link>
                                )}
                            >
                                {t("cancel")}
                            </Button>
                        </div>
                    </FormAccess>
                </FormProvider>
            </div>
        </>
    );
}
