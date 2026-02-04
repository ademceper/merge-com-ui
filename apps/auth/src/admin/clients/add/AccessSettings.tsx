/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/add/AccessSettings.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TextControl } from "../../../shared/keycloak-ui-shared";

import { FormAccess } from "../../components/form/FormAccess";
import { useAccess } from "../../context/access/Access";
import { FormFields } from "../ClientDetails";
import type { ClientSettingsProps } from "../ClientSettings";
import { LoginSettings } from "./LoginSettings";

export const AccessSettings = ({ client, save, reset }: ClientSettingsProps) => {
    const { t } = useTranslation();
    const { watch } = useFormContext<FormFields>();

    const { hasAccess } = useAccess();
    const isManager = hasAccess("manage-clients") || client.access?.configure;

    const protocol = watch("protocol");

    return (
        <FormAccess
            fineGrainedAccess={client.access?.configure}
            role="manage-clients"
        >
            <div className="flex flex-col gap-5">
            {!client.bearerOnly && <LoginSettings protocol={protocol} />}
            {protocol !== "saml" && (
                <TextControl
                    type="url"
                    name="adminUrl"
                    label={t("adminURL")}
                    labelIcon={t("adminURLHelp")}
                />
            )}
            </div>
        </FormAccess>
    );
};
