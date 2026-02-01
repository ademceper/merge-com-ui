/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/authorization/policy/Client.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useTranslation } from "react-i18next";
import { ClientSelect } from "../../../components/client/ClientSelect";

export const Client = () => {
    const { t } = useTranslation();

    return (
        <ClientSelect
            name="clients"
            label={t("clients")}
            helpText={t("policyClientHelp")}
            required
            defaultValue={[]}
            variant="typeaheadMulti"
            clientKey="id"
        />
    );
};
