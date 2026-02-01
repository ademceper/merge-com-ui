/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/dynamic/PasswordComponent.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useTranslation } from "react-i18next";
import { PasswordControl } from "../../../shared/keycloak-ui-shared";
import type { ComponentProps } from "./components";

export const PasswordComponent = ({
    name,
    label,
    helpText,
    defaultValue,
    required,
    isDisabled = false,
    convertToName
}: ComponentProps) => {
    const { t } = useTranslation();

    return (
        <PasswordControl
            name={convertToName(name!)}
            label={t(label!)}
            labelIcon={t(helpText!)}
            isDisabled={isDisabled}
            defaultValue={defaultValue?.toString()}
            rules={{
                required: { value: !!required, message: t("required") }
            }}
        />
    );
};
