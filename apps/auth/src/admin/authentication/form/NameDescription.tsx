/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/authentication/form/NameDescription.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useTranslation } from "react-i18next";
import { TextControl } from "../../../shared/keycloak-ui-shared";

export const NameDescription = () => {
    const { t } = useTranslation();

    return (
        <>
            <TextControl
                name="alias"
                label={t("name")}
                labelIcon={t("flowNameHelp")}
                rules={{ required: t("required") }}
            />
            <TextControl
                name="description"
                label={t("description")}
                labelIcon={t("flowDescriptionHelp")}
                rules={{
                    maxLength: {
                        value: 255,
                        message: t("maxLength", { length: 255 })
                    }
                }}
            />
        </>
    );
};
