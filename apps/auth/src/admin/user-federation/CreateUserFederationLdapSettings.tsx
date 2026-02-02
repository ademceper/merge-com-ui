/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/user-federation/CreateUserFederationLdapSettings.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { AlertVariant } from "../../shared/keycloak-ui-shared";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { useAlerts } from "../../shared/keycloak-ui-shared";
import { useRealm } from "../context/realm-context/RealmContext";
import {
    LdapComponentRepresentation,
    UserFederationLdapForm,
    serializeFormData
} from "./UserFederationLdapForm";
import { toUserFederation } from "./routes/UserFederation";
import { ExtendedHeader } from "./shared/ExtendedHeader";

export default function CreateUserFederationLdapSettings() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const form = useForm<LdapComponentRepresentation>({ mode: "onChange" });
    const navigate = useNavigate();
    const { realm } = useRealm();
    const { addAlert, addError } = useAlerts();

    const onSubmit = async (formData: LdapComponentRepresentation) => {
        try {
            await adminClient.components.create(serializeFormData(formData));
            addAlert(t("createUserProviderSuccess"), AlertVariant.success);
            navigate(toUserFederation({ realm }));
        } catch (error) {
            addError("createUserProviderError", error);
        }
    };

    return (
        <FormProvider {...form}>
            <ExtendedHeader
                provider="LDAP"
                noDivider
                save={() => form.handleSubmit(onSubmit)()}
            />
<div className="p-0">
                    <div className="bg-muted/30 p-4">
                    <UserFederationLdapForm onSubmit={onSubmit} />
                </div>
            </div>
        </FormProvider>
    );
}
