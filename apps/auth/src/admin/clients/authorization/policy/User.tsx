/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/authorization/policy/User.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useTranslation } from "react-i18next";
import { UserSelect } from "../../../components/users/UserSelect";

export const User = () => {
    const { t } = useTranslation();
    return (
        <UserSelect
            name="users"
            label="users"
            helpText={t("policyUsers")}
            defaultValue={[]}
            variant="typeaheadMulti"
        />
    );
};
